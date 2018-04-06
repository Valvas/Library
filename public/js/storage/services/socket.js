/****************************************************************************************************/

var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('storageAppServicesDetailJoin', document.getElementById('main').getAttribute('name'));
});

/****************************************************************************************************/

socket.on('fileUploaded', (error, file) =>
{
  var x = 0;
  var currentFile   = null;
  var alreadyExists = false;

  var files = document.getElementById('filesBlock').children;

  var browseCurrentFiles = () =>
  {
    if(files[x].getAttribute('name') == file.name + '.' + file.ext)
    {
      if(alreadyExists == false)
      {
        alreadyExists = true;

        if(files[x].children[0].getAttribute('class') == 'deleted') currentFile = files[x];
      }

      else
      {
        files[x].remove();
      }
    }

    if(files[x += 1] != undefined) browseCurrentFiles();
  }

  if(files[x] != undefined) browseCurrentFiles();

  if(alreadyExists == false)
  {
    var displays = document.getElementById('display').children;
    var currentDisplay = 'large';
    var x = 0;

    var getCurrentDisplay = () =>
    {
      if(displays[x].getAttribute('tag') == 'true')
      {
        currentDisplay = displays[x].getAttribute('name');
      }

      else
      {
        if(displays[x += 1] != undefined) getCurrentDisplay();
      }
    }

    if(displays.length > 0) getCurrentDisplay();

    var fileBlock       = document.createElement('div');
    var fileCheckbox    = document.createElement('div');
    var fileIcon        = document.createElement('div');
    var fileName        = document.createElement('div');

    fileBlock           .setAttribute('class', `file ${currentDisplay}`);
    fileBlock           .setAttribute('name', file.name + '.' + file.ext);
    fileCheckbox        .setAttribute('class', 'checkbox');
    fileName            .setAttribute('class', 'name');

    fileName            .innerText = file.name + '.' + file.ext;
    fileCheckbox        .innerHTML = `<input type='checkbox' class='target' onchange='selectFile(this)' />`;

    fileBlock           .appendChild(fileCheckbox);

    if(file.deleted == 0)
    {
      switch(file.ext)
      { 
        case 'doc':     fileBlock.setAttribute('tag', 'doc');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='icon word'><i class='fas fa-file-word'></i></div>`;                     break;
        case 'docx':    fileBlock.setAttribute('tag', 'doc');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='icon word'><i class='fas fa-file-word'></i></div>`;                     break;
        case 'ppt':     fileBlock.setAttribute('tag', 'ppt');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='icon powerpoint'><i class='fas fa-file-powerpoint'></i></div>`;         break;
        case 'pptx':    fileBlock.setAttribute('tag', 'ppt');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='icon powerpoint'><i class='fas fa-file-powerpoint'></i></div>`;         break;
        case 'xls':     fileBlock.setAttribute('tag', 'xls');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='icon excel'><i class='fas fa-file-excel'></i></div>`;                   break;
        case 'xlsx':    fileBlock.setAttribute('tag', 'xls');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='icon excel'><i class='fas fa-file-excel'></i></div>`;                   break;
        case 'pdf':     fileBlock.setAttribute('tag', 'pdf');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='icon pdf'><i class='fas fa-file-pdf'></i></div>`;                       break;
        case 'txt':     fileBlock.setAttribute('tag', 'txt');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='icon text'><i class='fas fa-file-alt'></i></div>`;                      break;
        case 'png':     fileBlock.setAttribute('tag', 'png');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='icon picture'><i class='fas fa-file-image'></i></div>`;                 break;
        case 'jpg':     fileBlock.setAttribute('tag', 'png');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='icon picture'><i class='fas fa-file-image'></i></div>`;                 break;
        default:        fileBlock.setAttribute('tag', 'default');   fileBlock.innerHTML = fileBlock.innerHTML + `<div class='icon default'><i class='fas fa-file'></i></div>`;                       break;
      }
    }

    else
    {
      switch(file.ext)
      { 
        case 'doc':     fileBlock.setAttribute('tag', 'doc');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='deleted'><i class='fas fa-times'></i></div><div class='icon word'><i class='fas fa-file-word'></i></div>`;                    break;
        case 'docx':    fileBlock.setAttribute('tag', 'doc');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='deleted'><i class='fas fa-times'></i></div><div class='icon word'><i class='fas fa-file-word'></i></div>`;                    break;
        case 'ppt':     fileBlock.setAttribute('tag', 'ppt');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='deleted'><i class='fas fa-times'></i></div><div class='icon powerpoint'><i class='fas fa-file-powerpoint'></i></div>`;        break;
        case 'pptx':    fileBlock.setAttribute('tag', 'ppt');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='deleted'><i class='fas fa-times'></i></div><div class='icon powerpoint'><i class='fas fa-file-powerpoint'></i></div>`;        break;
        case 'xls':     fileBlock.setAttribute('tag', 'xls');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='deleted'><i class='fas fa-times'></i></div><div class='icon excel'><i class='fas fa-file-excel'></i></div>`;                  break;
        case 'xlsx':    fileBlock.setAttribute('tag', 'xls');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='deleted'><i class='fas fa-times'></i></div><div class='icon excel'><i class='fas fa-file-excel'></i></div>`;                  break;
        case 'pdf':     fileBlock.setAttribute('tag', 'pdf');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='deleted'><i class='fas fa-times'></i></div><div class='icon pdf'><i class='fas fa-file-pdf'></i></div>`;                      break;
        case 'txt':     fileBlock.setAttribute('tag', 'txt');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='deleted'><i class='fas fa-times'></i></div><div class='icon text'><i class='fas fa-file-alt'></i></div>`;                     break;
        case 'png':     fileBlock.setAttribute('tag', 'png');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='deleted'><i class='fas fa-times'></i></div><div class='icon picture'><i class='fas fa-file-image'></i></div>`;                break;
        case 'jpg':     fileBlock.setAttribute('tag', 'png');       fileBlock.innerHTML = fileBlock.innerHTML + `<div class='deleted'><i class='fas fa-times'></i></div><div class='icon picture'><i class='fas fa-file-image'></i></div>`;                break;
        default:        fileBlock.setAttribute('tag', 'default');   fileBlock.innerHTML = fileBlock.innerHTML + `<div class='deleted'><i class='fas fa-times'></i></div><div class='icon default'><i class='fas fa-file'></i></div>`;                      break; 
      }
    }

    fileBlock           .appendChild(fileName);

    document.getElementById('filesBlock').appendChild(fileBlock);
  }

  else
  {
    if(currentFile != null)
    {
      var checkbox    = document.createElement('div');
      checkbox        .setAttribute('class', 'checkbox');
      checkbox        .innerHTML = `<input type='checkbox' class='target' onchange='selectFile(this)' />`;
      currentFile     .insertBefore(checkbox, currentFile.children[0]);
      currentFile     .children[1].remove();
    }
  }
});

/****************************************************************************************************/

socket.on('fileRemoved', (error, fileName) =>
{
  var x = 0;
  var currentFile   = null;
  var alreadyExists = false;

  var files = document.getElementById('filesBlock').children;

  var browseCurrentFiles = () =>
  {
    if(files[x].getAttribute('name') == fileName)
    {
      if(alreadyExists == false)
      {
        alreadyExists = true;

        if(files[x].children[0].getAttribute('class') == 'checkbox') currentFile = files[x];
      }

      else
      {
        files[x].remove();
      }
    }

    if(files[x += 1] != undefined) browseCurrentFiles();
  }

  if(files[x] != undefined) browseCurrentFiles();

  if(alreadyExists == true && currentFile != null)
  {
    if(currentFile.children[0].children[0].checked)
    {
      var selectedFilesLabelAndCounter = document.getElementById('actions').children[0].innerText.split(':');

      document.getElementById('actions').children[0].innerText = `${selectedFilesLabelAndCounter[0]} : ${parseInt(selectedFilesLabelAndCounter[1]) - 1}`;
    }

    var deleted       = document.createElement('div');
    deleted           .setAttribute('class', 'deleted');
    deleted           .innerHTML = `<i class='fas fa-times'></i>`;
    currentFile       .insertBefore(deleted, currentFile.children[0]);
    currentFile       .children[1].remove();
  }
});

/****************************************************************************************************/