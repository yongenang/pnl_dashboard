// Linking pages

document.addEventListener("DOMContentLoaded", function() { //Mapping the IDs to their target pages
    const navLinks = {
        showDashboard: "dboard.html",
        dataUpload: "upload.html",
        dataAnal: "analytic.html",
        dataSales: "sales.html",
        dataSet: "setting.html",
        dataNotify: "notification.html",
        dataSecurity: "security.html"
    };

    for (const [id, url] of Object.entries(navLinks)){
        const element = document.getElementById(id);
        if (element){
            element.addEventListener("click", function(){
                window.location.href = url;

           
            });
        }
    }
});



// Handle navigation on click
/*<script> 
 document.getElementById("dataUpload").addEventListener("click", function () {
     window.location.href = "upload.html";  // Change this to your target page
}); */