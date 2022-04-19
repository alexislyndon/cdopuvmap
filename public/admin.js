$.ajaxSetup({
    beforeSend: function () {
      $("#spinner").show();
    },
    complete: function () {
      $("#spinner").fadeOut();
    },
  });

$(function() {

    $.ajaxSetup({
        beforeSend: function () {
          $("#spinner").show();
        },
        complete: function () {
          $("#spinner").fadeOut();
        },
      });

    $('#routes').on('click', (params) => {
        $('#main').load('/admin/routes')
    })
    $('#reports').on('click', (params) => {
        $('#main').load('/admin/reports')
    })
});