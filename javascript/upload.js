const fileInput = document.getElementById("fileInput");
const generateBtn = document.getElementById("generateBtn");
const removeBtn = document.getElementById("removeBtn");

fileInput.addEventListener("change", function () {
  const file = fileInput.files[0];

  if (file) {
    removeBtn.style.display = "inline-block";

    if (file.name.endsWith(".xlsx")){
        generateBtn.style.display = "inline-block";
    } else {
        generateBtn.style.display = "none";
        alert("Please Upload a valid file.");
    }
   } else {
    //If no file is selected
    generateBtn.style.display = "none";
    removeBtn.style.display = "none";
   }
  });
  
generateBtn.addEventListener("click", function () {
  // Add your logic to generate report here
  alert("Generate report triggered!");
});

removeBtn.addEventListener("click", function() {
  fileInput.value = ""; //Clear the selected file
  generateBtn.style.display = "none";
  removeBtn.style.display = "none";
});