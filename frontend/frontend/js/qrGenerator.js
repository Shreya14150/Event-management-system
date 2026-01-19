function generateQRCode(data, elementId) {
  const canvas = document.getElementById(elementId);
  if(canvas){
    new QRCode(canvas, {
      text: data,
      width: 128,
      height: 128,
      colorDark : "#000000",
      colorLight : "#ffffff",
    });
  }
}
