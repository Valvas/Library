window.onload = $(() =>
{
  $('body').on('click', '.admin-rights-status .save', (event) =>
  {
    var x = 0, rightsObject = {};
    var rights = document.getElementById('admin-rights-detail').getElementsByClassName('element');

    var rightsLoop = () =>
    {
      rightsObject[rights[x].getAttribute('name')] = rights[x].getAttribute('class').split(' ')[1];

      if(rights[x += 1] != undefined) rightsLoop();

      else
      {
        document.getElementById('save-button').style.display = 'none';

        var spinner = document.createElement('div');
        spinner.setAttribute('id', 'loading');
        spinner.setAttribute('class', 'loading');
        spinner.innerHTML = '<i class="fa fa-circle-o-notch fa-spin fa-2x fa-fw"></i>';
        document.getElementById('admin-rights-status').appendChild(spinner);

        $.ajax(
        {
          type: 'PUT', timeout: 5000, dataType: 'JSON', data: { account: document.getElementById('admin-main-block').getAttribute('name'), service: document.getElementById('admin-rights-detail').getAttribute('name'), access: rightsObject.access, comment: rightsObject.comment, download: rightsObject.download, upload: rightsObject.upload, remove: rightsObject.remove, }, url: '/admin/rights/update-account-rights', success: () => {},
          error: (xhr, status, error) => 
          { 
            document.getElementById('loading').remove();
            document.getElementById('save-button').style.display = 'block';
            printError(JSON.parse(xhr.responseText).message); 
          } 
                
        }).done((json) =>
        {
          document.getElementById('loading').remove();

          $('#admin-rights-status .history-element').remove();

          $('#admin-rights-status .empty').show();

          printSuccess(json.message);
        });
      }
    }

    if(rights.length > 0) rightsLoop();
  });
});