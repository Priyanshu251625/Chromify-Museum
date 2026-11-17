# 🎨 Chromify Museum
### Bringing Monochrome Memories Back to Life

**Chromify Museum** is a web-based image colorization application that transforms black-and-white photographs into colorized images using a pre-trained deep learning model. Built with React, Vite, Python and OpenCV, it combines an elegant photograph-restoration interface with a Caffe-based neural network for automated image colorization.

The project aims to make AI-powered photograph colorization accessible through a simple, interactive web experience.

<p align="center">
  <a href="https://chromify-museum-qbg64yfzjrhrbnf77e9tf5.streamlit.app/">
    <strong>🌐 Live Application</strong>
  </a>
</p>

---

## ✨ Features

- **AI-Powered Colorization:** Automatically predicts plausible colors for black-and-white photographs using a pre-trained deep learning model.
- **Interactive Restoration Studio:** Upload and preview photographs through a custom React-based interface.
- **Side-by-Side Comparison:** View the original photograph alongside its colorized output.
- **Multiple Image Formats:** Supports PNG, JPG, JPEG, BMP and WEBP.
- **Image Download:** Save the restored photograph as a PNG file.
- **Input Validation:** Handles unsupported formats, invalid images and file-size restrictions.
- **Responsive Interface:** A dark, museum-inspired design focused on simplicity and visual presentation.

---

## 🖼️ Application Preview

<p align="center">
  <em>From monochrome to memory.</em>
</p>

<!-- Add your application screenshots here -->
<!-- Example:
<p align="center">
  <img src="assets/chromify-preview.png" width="85%" alt="Chromify Museum interface">
</p>
-->

---

## 🧠 How It Works

Chromify Museum uses a pre-trained Caffe model based on the deep learning approach introduced in *Colorful Image Colorization* by Richard Zhang, Phillip Isola and Alexei A. Efros.

Instead of predicting all three RGB channels directly, the model operates in the **CIELAB color space**, where lightness and chromatic information are represented separately.

### The Colorization Pipeline

1. **Image Input:** The uploaded photograph is decoded using OpenCV.
2. **Color Space Conversion:** The image is converted from BGR to RGB and subsequently to CIELAB.
3. **Lightness Extraction:** The L channel, representing image lightness, is extracted while the original image's chromatic information is discarded.
4. **Preprocessing:** The L channel is resized to 224 × 224 pixels and normalized by subtracting 50.
5. **Deep Learning Inference:** The pre-trained Caffe network processes the lightness channel and predicts the corresponding a and b color channels.
6. **Color Reconstruction:** The predicted a and b channels are resized to the original image dimensions and combined with the original L channel.
7. **Output Generation:** The reconstructed Lab image is converted back to BGR, clipped to the valid range and encoded as a PNG image.

### Understanding CIELAB Color Space

| Channel | Representation | Role |
|---|---|---|
| L | Lightness | Original grayscale information supplied to the model |
| a | Green ↔ Red | Predicted chromatic information |
| b | Blue ↔ Yellow | Predicted chromatic information |

The model predicts a and b values using 313 quantized color bins, allowing it to estimate plausible color distributions from grayscale information.

---

## 🏗️ System Architecture

Chromify Museum combines a React frontend with a Python-based image processing backend.

```text
              USER
                |
                v
       React + Vite Frontend
                |
         Image Selection
                |
                v
       Streamlit Integration
       (Custom React Component)
                |
          Base64 Image Data
                |
                v
       Python Processing Layer
                |
                v
        OpenCV DNN Module
                |
                v
       Pre-trained Caffe Model
                |
          Color Prediction
                |
                v
        Reconstructed Image
                |
          PNG Encoding
                |
                v
       React Result Preview
                |
                v
          Download Image
```

The application also retains its Flask backend and REST API implementation. The Streamlit deployment invokes the existing Python colorization function directly, avoiding an additional HTTP request between the Streamlit layer and the inference logic.

---

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Styling | CSS |
| Icons | Lucide React |
| Backend | Python, Flask |
| Web Application Hosting | Streamlit Community Cloud |
| Computer Vision | OpenCV DNN |
| Deep Learning Model | Caffe |
| Numerical Computing | NumPy |
| React Integration | Streamlit Custom Components |

---

## 📁 Project Structure

```text
Chromify-Museum/
│
├── app.py
│   └── Flask backend and image colorization logic
│
├── streamlit_app.py
│   └── Streamlit application and Python integration
│
├── requirements.txt
│   └── Python dependencies
│
├── models/
│   ├── colorization_deploy_v2.prototxt
│   └── colorization_release_v2.caffemodel
│
├── pts_in_hull.npy
│   └── 313 color cluster centers
│
├── frontend/
│   └── Original React/Vite application
│
├── streamlit_component/
│   ├── build/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.12
- Node.js and npm
- Git
- Git LFS

### 1. Clone the Repository

```bash
git clone https://github.com/Priyanshu251625/Chromify-Museum.git

cd Chromify-Museum
```

### 2. Select the Streamlit Integration Branch

```bash
git checkout streamlit-integration
```

### 3. Set Up the Python Environment

```bash
python -m venv venv
```

Activate the environment.

**Windows:**

```cmd
venv\Scripts\activate
```

**Linux / macOS:**

```bash
source venv/bin/activate
```

### 4. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 5. Install Frontend Dependencies

```bash
cd streamlit_component
npm install
```

### 6. Build the React Component

```bash
npm run build
```

Return to the project root:

```bash
cd ..
```

### 7. Run the Application

```bash
streamlit run streamlit_app.py
```

The application will be available at:

```text
http://localhost:8501
```

---

## 📦 Model Requirements

The application requires three pre-trained model resources:

| File | Purpose |
|---|---|
| `colorization_deploy_v2.prototxt` | Defines the Caffe network architecture |
| `colorization_release_v2.caffemodel` | Contains the pre-trained network weights |
| `pts_in_hull.npy` | Stores the 313 color cluster centers |

These resources must be placed in the expected project locations:

```text
models/
├── colorization_deploy_v2.prototxt
└── colorization_release_v2.caffemodel

pts_in_hull.npy
```

The Caffe model weights are large and are tracked using Git LFS in this repository.

---

## ⚙️ Application Configuration

| Configuration | Value |
|---|---|
| Maximum upload size | 16 MB |
| Supported formats | PNG, JPG, JPEG, BMP, WEBP |
| Model input dimensions | 224 × 224 |
| Color quantization | 313 bins |
| Output format | PNG |
| Model framework | Caffe |
| Inference engine | OpenCV DNN |

---

## ☁️ Deployment

Chromify Museum is deployed using **Streamlit Community Cloud**.

The deployment uses:

- GitHub as the source repository.
- The `streamlit-integration` branch.
- `streamlit_app.py` as the application entry point.
- `requirements.txt` for dependency installation.
- A React production build served through a Streamlit custom component.

**Live Application:**  
https://chromify-museum-qbg64yfzjrhrbnf77e9tf5.streamlit.app/

---

## ⚠️ Limitations

- The model generates plausible color predictions rather than recovering historically accurate colors.
- Results may vary depending on image quality, lighting, contrast and subject matter.
- Some photographs may produce desaturated or unexpected color combinations.
- Colorization is an inference-based process and does not involve retraining the original model.
- Processing time depends on the available computing resources and image dimensions.

---

## 📚 References and Acknowledgements

This project builds upon existing research and publicly available implementations of deep learning-based image colorization.

**Original implementation inspiration:**

[shsarv — Machine Learning Projects: Colorize Black & White Images (OpenCV)](https://github.com/shsarv/Machine-Learning-Projects/tree/main/Colorize%20Black%20%26%20white%20images%20%5BOPEN%20CV%5D)

**Research paper:**

Richard Zhang, Phillip Isola and Alexei A. Efros.

*Colorful Image Colorization.* European Conference on Computer Vision (ECCV), 2016.

[Research Paper](https://arxiv.org/abs/1603.08511)

**Original model and resources:**

[richzhang/colorization — GitHub](https://github.com/richzhang/colorization)

**OpenCV Documentation:**

[OpenCV DNN Module](https://docs.opencv.org/)

---

## 👨‍💻 Author

**Priyanshu Rajhans**

B.Tech — Computer Science and Engineering

[GitHub](https://github.com/Priyanshu251625)

---

<p align="center">
  <strong>CHROMIFY MUSEUM</strong><br>
  <em>From monochrome to memory.</em>
</p>
