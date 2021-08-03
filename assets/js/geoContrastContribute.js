
// contribute form popup actions

function openContributePopup() {
    var popup = document.getElementById('contribute-popup');
    popup.className = "popup"; // is-visually-hidden";
    //setTimeout(function() {
        //container.className = "MainContainer is-blurred";
        //popup.className = "popup";
    //}, 100);
    //container.parentElement.className = "ModalOpen";
};

function closeContributePopup() {
    var popup = document.getElementById('contribute-popup');
    popup.className = "popup is-hidden is-visually-hidden";
    //body.className = "";
    //container.className = "MainContainer";
    //container.parentElement.className = "";
};

