/****************************************************************************************************/

var boldSelected = false;
var italicSelected = false;
var currentColor = '#000000';
var currentLineFocused = 0;

/****************************************************************************************************/

if(document.getElementById('editorContainer')) createToolBox();

function createToolBox()
{
  const editorContainer = document.getElementById('editorContainer');

  var toolBox = document.createElement('div');

  toolBox.style.fontFamily = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`;
  toolBox.style.border = '1px solid rgba(0,0,0,0.24)';
  toolBox.style.padding = '5px';

  toolBox.innerHTML += `<button onclick="selectBold(this)" onmouseleave="mouseLeaveToolBoxElement(this)" onmouseover="mouseOverToolBoxElement(this)" style="border-radius:4px; margin:5px; cursor:pointer; background-color:#FFFFFF; border:none; outline:none; font-weight:bold; font-size:1.5em;">B</button>`;
  toolBox.innerHTML += `<button onclick="selectItalic(this)" onmouseleave="mouseLeaveToolBoxElement(this)" onmouseover="mouseOverToolBoxElement(this)" style="border-radius:4px; margin:5px; cursor:pointer; background-color:#FFFFFF; border:none; outline:none; font-style:italic; font-size:1.5em;">T</button>`;

  editorContainer.appendChild(toolBox);

  var contentBox = document.createElement('div');

  contentBox.setAttribute('contenteditable', 'true');

  contentBox.setAttribute('id', 'editorContainerContent');

  contentBox.addEventListener('input', contentEdited);
  contentBox.addEventListener('focus', contentFocused);

  contentBox.innerHTML = '<p><br></p>';

  contentBox.style.width = '100%';
  contentBox.style.borderRight = '1px solid rgba(0,0,0,0.24)';
  contentBox.style.borderBottom = '1px solid rgba(0,0,0,0.24)';
  contentBox.style.borderLeft = '1px solid rgba(0,0,0,0.24)';
  contentBox.style.outline = 'none';
  contentBox.style.padding = '10px';
  contentBox.style.boxSizing = 'border-box';
  contentBox.style.fontFamily = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`;

  editorContainer.appendChild(contentBox);
}

/****************************************************************************************************/

function mouseOverToolBoxElement(button)
{
  button.style.color = '#428BCA';
}

/****************************************************************************************************/

function mouseLeaveToolBoxElement(button)
{
  button.style.color = '#000000';
}

/****************************************************************************************************/

function selectBold(button)
{
  button.setAttribute('onclick', 'unselectBold(this)');

  button.removeAttribute('onmouseover');
  button.removeAttribute('onmouseleave');

  button.style.color = '#428BCA';
  button.style.backgroundColor = 'rgba(0,0,0,0.06)';

  boldSelected = true;
}

/****************************************************************************************************/

function selectItalic(button)
{
  button.setAttribute('onclick', 'unselectItalic(this)');

  button.removeAttribute('onmouseover');
  button.removeAttribute('onmouseleave');

  button.style.color = '#428BCA';
  button.style.backgroundColor = 'rgba(0,0,0,0.06)';

  italicSelected = true;
}

/****************************************************************************************************/

function unselectBold(button)
{
  button.setAttribute('onclick', 'selectBold(this)');
  button.setAttribute('onmouseover', 'mouseOverToolBoxElement(this)');
  button.setAttribute('onmouseleave', 'mouseLeaveToolBoxElement(this)');

  button.style.color = '#000000';
  button.style.backgroundColor = '#FFFFFF';

  boldSelected = false;
}

/****************************************************************************************************/

function unselectItalic(button)
{
  button.setAttribute('onclick', 'selectItalic(this)');
  button.setAttribute('onmouseover', 'mouseOverToolBoxElement(this)');
  button.setAttribute('onmouseleave', 'mouseLeaveToolBoxElement(this)');

  button.style.color = '#000000';
  button.style.backgroundColor = '#FFFFFF';

  italicSelected = false;
}

/****************************************************************************************************/

function contentFocused(event)
{
  if(document.getElementById('editorContainerContent').innerHTML.length === 0)
  {
    var line = document.createElement('p');

    line.innerHTML = '<br>';

    document.getElementById('editorContainerContent').appendChild(line);
  }

  console.log(window.getSelection())
  const selection = window.getSelection();

  console.log(selection);
  const node = selection.focusNode;
  console.log(node);
  if(boldSelected)
  {

  }
}

/****************************************************************************************************/

function contentEdited(event)
{
  if(document.getElementById('editorContainerContent').innerHTML.length === 0)
  {
    var line = document.createElement('p');

    line.innerHTML = '<br>';
    
    document.getElementById('editorContainerContent').appendChild(line);
  }
}

/****************************************************************************************************/