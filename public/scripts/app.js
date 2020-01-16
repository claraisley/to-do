
let task;

// function that allows a task item to be dragged
function drag(ev) {
  ev.dataTransfer.setData("Text", ev.target.id);
  task = $(event.target).text();
}

// function the allows the item to be dropped into the category column
function allowDrop(ev) {
  ev.preventDefault();
  if (ev.target.getAttribute("draggable") == "true")
    ev.dataTransfer.dropEffect = "none"; // dropping is not allowed
  else
    ev.dataTransfer.dropEffect = "all";
}

// function that drops the item and sends the event to the route for updating the category
function drop(ev) {
  var data = ev.dataTransfer.getData("Text");
  ev.target.appendChild(document.getElementById(data));
  ev.preventDefault();
  const category = $(ev.target)
    .parent()
    .attr('data-category_id');
  try {
    $.ajax('/tasks/move', {
      method: 'POST',
      data: {
        input: task,
        category_id: category
      },
    })
  } catch (err) {
    console.error(err);
  }
}

