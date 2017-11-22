window.onload = $(function()
{
  $('body').on('click', '#home-link', function(event)
  {
    location = '/home';
  });

  $('body').on('click', '#admin-link', function(event)
  {
    location = '/admin';
  });

  $('body').on('click', '#logout-link', function(event)
  {
    createConfirmationPopup(
    {
      title: 'SE DECONNECTER',
      message: 'Êtes-vous sûr(e) ?',
      info: undefined,
      perform: 'Oui',
      cancel: 'Non'
    }, 'logout-popup', undefined);
  });
});