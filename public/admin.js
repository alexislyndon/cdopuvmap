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
    $('#account').on('click', (params) => {
        $('#main').load('/admin/account')
    })


$(document).on('click', '.edit', function () {
    var row = $(this).closest('tr');
    $(this).parent().siblings('td.r').each(function () {
        if ($(this).hasClass('e')) {
            // $(this).attr('contenteditable','true');
            var content = $(this).html().trim();
            var ename = $(this).attr('name')
            $(this).html(`<input name="${ename}" value="${content}" />`);
        }
        if($(this).hasClass('color')) $(this).find('input').removeAttr('disabled');
        if($(this).hasClass('data-ul')) {
            $(this).find('ul').append('<li><button class="add-path">Add new</button></li>')
            $(document).on('click', 'li.path', function (e) {
                var x = $(this).outerWidth() - 30 <= e.offsetX
                if ($(this).outerWidth() - 30 <= e.offsetX) {
                    $(this).remove();
                    console.log('x');
                }
            });
            $(document).on('click', '.add-path', function(){
                $(this).parent().before('<li class="path closable"> <a href="javascript:void(0);" class="aftered"><input name="path" value=""></a></li>')
                
                console.log($(this).parent().prev('input'));
            })
            $(this).find('a').toggleClass('aftered');
            // $(this).css("background-color", "yellow");
            $(this).find('li>a').each(function(){
                var content = $(this).html().trim();
                $(this).html('<input name="path" value="' + content + '" />');
                $(this).parent().addClass('closable')
            })
        }
        
    });

    //Reportss
    $(this).parent().siblings('.editable').each(function() {
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
var data = {}
$(document).on('click', '.save', function () {
    var id = $(this).closest('tr').data('id')
    // console.log($(this));
    var row = $(this).parent().closest('tr');
    // row.wrap('form')
    // console.log(row);
    // var dd = row.serializeArray()
    // row.unwrap()
    // console.log(dd);
    var pathArr = []
    if($(document).find('h2').html() === 'Routes'){
        console.log('re',row.find('.r.e'));
        // $(this).closest('tr')
        row.find('input').not('').each(function () {
            if($(this).attr('type') === 'color') {$(this).attr('disabled', true); data[$(this).attr('name')] = $(this).val(); return}
            $(document).off('click', 'li.path') //path
            $(this).parent('a').toggleClass('aftered'); //path
            $('.add-path').parent().remove(); //path
            $(document).off('click', '.add-path'); //path
            if(!$(this).val().trim()) $(this).closest('li').remove()
            // console.log($(this));
            // if($(this).parent().parent() != row) return
            // var content = $(this).find('input').val();
            // if(!content) {$(this).remove(); return}
            // var data = $(this).serialize()
            // console.log(data);
            // $(this).html(content);
            // row.contents().unwrap();
            var content = $(this).val().trim();
            if(!content) {$(this).remove(); return}
            if($(this).attr('name') === 'path') {
                pathArr.push($(this).val())
            }else {
                data[$(this).attr('name')] = $(this).val()
            }
            $(this).html(content);
            $(this).contents().unwrap();
        });
        data['path'] = pathArr;
        console.log(JSON.stringify(data, null, 2));

        $.ajax({
            type: "POST",
            url: '/admin/routes/' + id,
            data: data,
            success: function () {
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
    }
    if($(document).find('h2').html() === 'Reports'){
        row.closest('tr').find('select#status').each(function() {
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
    }
    


    
    $(this).siblings('.edit').show();
    $(this).siblings('.delete').show();
    $(this).hide();
    // console.log(JSON.stringify(data, null, 2));
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

$(document).on('click','.slider-switch', function(){
    console.log($(this).closest('input'));

    if($('#2fa').is(":checked")){ //already checked - going to disabled
        alert('disabled')
    }else { // from disabled to enabled
        $(this).closest("div").append('<button id="generate"> Generate Secret </button>')
        $(document).on('click','#generate', function(){
            $.ajax({
                url: '/admin/gen2fa',
                method: 'POST',
                data: "",
                success: function (data) {
                    if (data.qr) {
                        console.log(data);
                        $('.2fa').append('<img src="' + data.qr + '">')
                    }
                },
                error: function () {
                    $('#m').fadeIn().delay(1800).fadeOut();
                }
    
            })
        })
        alert('nyay')
    }
    
});


$('#routes').click()
});