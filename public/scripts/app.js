$(() => {
  $.ajax({
    method: "GET",
    url: "/api/users"
  }).done((users) => {
    for(user of users) {
      $("<div>").text(user.name).appendTo($("body"));
    }
  });;




});

function drag(ev) {
  ev.dataTransfer.setData("Text", ev.target.id);
}

function allowDrop(ev) {
  ev.preventDefault();
  if (ev.target.getAttribute("draggable") == "true")
        ev.dataTransfer.dropEffect = "none"; // dropping is not allowed
    else
        ev.dataTransfer.dropEffect = "all"; 
}

function drop(ev) {
  var data = ev.dataTransfer.getData("Text");
  console.log(ev.target);
  ev.target.appendChild(document.getElementById(data));
  ev.preventDefault();
}
