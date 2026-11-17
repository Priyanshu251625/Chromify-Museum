
from pathlib import Path
import base64
import binascii

import streamlit as st
import streamlit.components.v1 as components

import app as chromify_backend


st.set_page_config(
    page_title="Chromify Museum",
    page_icon="🎨",
    layout="wide",
)

BASE_DIR = Path(__file__).resolve().parent
COMPONENT_BUILD = BASE_DIR / "streamlit_component" / "build"

# Register the React frontend as a Streamlit custom component.
if not COMPONENT_BUILD.is_dir():
    st.error(
        "React component build not found. "
        "Run npm run build inside streamlit_component first."
    )
    st.stop()

chromify_component = components.declare_component(
    "chromify_museum",
    path=str(COMPONENT_BUILD),
)


# Load the existing Caffe model only when the first image is submitted.
@st.cache_resource
def get_colorizer():
    chromify_backend.load_model()
    return chromify_backend.colorize_bytes


# Initialize session state.
if "status" not in st.session_state:
    st.session_state.status = "idle"

if "result" not in st.session_state:
    st.session_state.result = None

if "error" not in st.session_state:
    st.session_state.error = None

if "last_processed_request" not in st.session_state:
    st.session_state.last_processed_request = None


# Render the React interface and receive its actions.
component_value = chromify_component(
    status=st.session_state.status,
    result=st.session_state.result,
    error=st.session_state.error,
    key="chromify_interface",
    default=None,
)


# Process each component request only once.
if isinstance(component_value, dict):
    request_id = component_value.get("requestId")

    if request_id and request_id != st.session_state.last_processed_request:
        st.session_state.last_processed_request = request_id
        action = component_value.get("action")

        if action == "reset":
            st.session_state.status = "idle"
            st.session_state.result = None
            st.session_state.error = None
            st.rerun()

        elif action == "colorize":
            try:
                filename = component_value.get("filename", "image.png")
                image_base64 = component_value.get("imageBase64", "")

                allowed_extensions = {
                    ".png", ".jpg", ".jpeg", ".bmp", ".webp"
                }

                if Path(filename).suffix.lower() not in allowed_extensions:
                    raise ValueError(
                        "Supported formats: PNG, JPG, JPEG, BMP and WEBP."
                    )

                # Accept either plain base64 or a complete data URL.
                if "," in image_base64 and image_base64.startswith("data:"):
                    image_base64 = image_base64.split(",", 1)[1]

                try:
                    raw_bytes = base64.b64decode(
                        image_base64,
                        validate=True
                    )
                except (binascii.Error, ValueError):
                    raise ValueError("The uploaded image could not be read.")

                if not raw_bytes:
                    raise ValueError("The uploaded image is empty.")

                if len(raw_bytes) > 16 * 1024 * 1024:
                    raise ValueError("The maximum image size is 16 MB.")

                colorize_bytes = get_colorizer()
                output_bytes = colorize_bytes(raw_bytes)

                result_base64 = base64.b64encode(
                    output_bytes
                ).decode("utf-8")

                st.session_state.result = (
                    "data:image/png;base64," + result_base64
                )
                st.session_state.status = "success"
                st.session_state.error = None

            except FileNotFoundError as exc:
                st.session_state.status = "error"
                st.session_state.error = str(exc)
                st.session_state.result = None

            except Exception as exc:
                st.session_state.status = "error"
                st.session_state.error = str(exc)
                st.session_state.result = None

            st.rerun()
