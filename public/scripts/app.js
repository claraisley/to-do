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

$(() => {
  // function that drags and drops
  let task;
  $('.list-item').on('mousedown', (event) => {
    task = $(event.target).text();
  });

  //function that will database when task is dragged into a new category

  $('.list-group').on('drop', function (event) {
    const category = $(event.target)
      .parent()
      .attr('data-category_id');


    try {
      console.log("this is task and category", task ,category)
      $.ajax('/tasks', {
        method: 'POST',
        data: {
          input: task,
          category_id: category
        }
      })
    } catch (err) {
      console.error(err);
    }
  })

});
