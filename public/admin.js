$.ajaxSetup({
    beforeSend: function () {
        $("#spinner").show();
    },
    complete: function () {
        $("#spinner").fadeOut();
    },
});

$(function () {

    $.ajaxSetup({
        beforeSend: function () {
            $("#spinner").removeAttr('hidden')
        },
        always: function () {
            $("#spinner").attr('hidden')
        },
    });

    $('#routes').on('click', (params) => {
        $('#main').load('/admin/routes')
    })
    $('#reports').on('click', (params) => {
        $('#main').load('/admin/reports')
    })
});

$(document).on('click', '.edit', function () {
    $(this).parent().siblings('td.data').each(function () {
        if ($(this).hasClass('data')) {
            // do stuff here to output to the page
            var content = $(this).html().trim();
            $(this).html('<input value="' + content + '" />');
        }
    });

    $(this).siblings('.save').show();
    $(this).siblings('.delete').hide();
    $(this).hide();
});

$(document).on('click', '.save', function () {
    var row = $(this).closest('tr');
    $(this).closest('tr').find('input').each(function () {
        // if($(this).parent().parent() != row) return
        var content = $(this).val();
        if(!content) {$(this).remove(); return}
        $(this).html(content);
        $(this).contents().unwrap();
    });
    $(this).siblings('.edit').show();
    $(this).siblings('.delete').show();
    $(this).hide();

});


$(document).on('click', '.delete', function () {
    $(this).parents('tr').remove();
});

$('.add').click(function () {
    $(this).parents('table').append('<tr><td class="data"></td><td class="data"></td><td class="data"></td><td><button class="save">Save</button><button class="edit">Edit</button> <button class="delete">Delete</button></td></tr>');
});