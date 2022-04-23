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


$(document).on('click', '.edit', function () {
    $(this).parent().siblings('td.data').each(function () {
        if ($(this).hasClass('data')) {
            // do stuff here to output to the page
            var content = $(this).html().trim();
            $(this).html('<input value="' + content + '" />');
        }
        if ($(this).hasClass('editable')) {
        }
        
    });
    $(this).parent().siblings('.editable').each(function() {
        // $(this).attr('contenteditable','true');
        $(this).toggleClass('tt')
        var content = $(this).html().trim();
        $(this).html(`
        <select name="status" id="status">
            <option value="New" ${(content === 'New') ? 'selected' : ''}>New</option>
            <option value="Resolved" ${(content === 'Resolved') ? 'selected' : ''}>Resolved</option>
            <option value="Unactionable" ${(content === 'Unactionable') ? 'selected' : ''}>Unactionable</option>
        </select>
        `);
    })

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
    $(this).closest('tr').find('select#status').each(function() {
        var select = $(this)
        var status = $(this).val()
        var id = $(this).closest('tr').data('id')
        var data = $(this).serialize()
        // $(this).closest('td').html(status)
        $.ajax({
            type: "POST",
            url: '/admin/reports/' + id,
            data: data,
            success: function () {
                select.closest('td').text(status)
                select.remove();
                console.log('Status changed!');
                $(".success-msg")
                .html("Updated Successfully")
                .fadeIn()
                .delay(1800)
                .fadeOut();
            },
            error: function (params) {
                console.log(params);
            }
        });
    })
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

var tabs = document.getElementsByClassName('Tab');

Array.prototype.forEach.call(tabs, function(tab) {
	tab.addEventListener('click', setActiveClass);
});

function setActiveClass(evt) {
	Array.prototype.forEach.call(tabs, function(tab) {
		tab.classList.remove('active');
	});
	
	evt.currentTarget.classList.add('active');
}

$('#routes').click()
});