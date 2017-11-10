window.onload = $(function()
{
    $('body').on('click', '#page-not-found-link', function()
    {
        location = '/home';
    });
});