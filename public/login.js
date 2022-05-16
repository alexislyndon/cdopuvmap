$(function () {

    $('form#login').on('submit', function (e) {
        e.preventDefault()
        $.ajax({
            url: '/login',
            method: 'POST',
            data: $(this).serialize(),
            success: function (data) {
                if (data.user) {
                    console.log(data);
                    if(data.totp){
                        $('input#userid').val(data.user)
                        $('form#verify').show();
                    } else{
                        location.assign('/admin')
                    }
                }
            },
            error: function () {
                $('#m').fadeIn().delay(1800).fadeOut();
            }

        })
    })

    $('form#verify').on('submit', function (e) {
        e.preventDefault()
        $.ajax({
            url: '/verify',
            method: 'POST',
            data: $(this).serialize(),
            success: function (data) {
                if(data.verified) {
                    location.assign('/admin')
                } else {
                    $('#m').fadeIn().delay(1800).fadeOut();
                }
            },
            error: function () {
                $('#m').fadeIn().delay(1800).fadeOut();
            }

        })
    })

})