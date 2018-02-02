$.ajax(
{
  type: 'GET', timeout: 20000, dataType: 'JSON', url: '/init/test/database', success: () => {},
  error: (xhr, status, error) => 
  { 
    document.getElementById('database').setAttribute('class', 'failed');
    document.getElementById('database').innerHTML = `<i class='fas fa-times-circle'></i>${xhr.responseJSON.message}`;
  }

}).done((json) => 
{
  console.log(json);
});