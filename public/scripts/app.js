
let task;

function drag(ev) {
  ev.dataTransfer.setData("Text", ev.target.id);
  task = $(event.target).text();
}
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


function allowDrop(ev) {
  ev.preventDefault();
  if (ev.target.getAttribute("draggable") == "true")
        ev.dataTransfer.dropEffect = "none"; // dropping is not allowed
    else
        ev.dataTransfer.dropEffect = "all";
}

function drop(ev) {
  var data = ev.dataTransfer.getData("Text");
  ev.target.appendChild(document.getElementById(data));
  ev.preventDefault();
  const category = $(ev.target)
      .parent()
      .attr('data-category_id');


    try {
      console.log("this is task and category", task ,category);
      $.ajax('/tasks/move', {
        method: 'POST',
        data: {
          input: task,
          category_id: category
        }
      })
    } catch (err) {
      console.error(err);
    }
  }

