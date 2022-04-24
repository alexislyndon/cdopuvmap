$(function () {

    $('form').on('submit', function (e) {
        e.preventDefault()
        $.ajax({
            url: '/login',
            method: 'POST',
            data: $(this).serialize(),
            success: function (data) {
                if (data.user) {
                    location.assign('/admin')
                }
            },
            error: function () {
                $('#m').fadeIn().delay(1800).fadeOut();
            }

        })
    })

})