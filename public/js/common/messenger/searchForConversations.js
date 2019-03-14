/****************************************************************************************************/

function searchForConversations(event)
{
  const searchedValue = event.target.value.toLowerCase().trim();

  const conversationsList = document.getElementById('messengerConversationsList').children;

  if(conversationsList.length === 0) return;

  document.getElementById('messengerBlockEmptySearch').removeAttribute('style');

  var counter = 0;

  for(var x = 0; x < conversationsList.length; x++)
  {
    if(conversationsList[x].children[1].children[0].innerText.toLowerCase().includes(searchedValue))
    {
      counter += 1;
      conversationsList[x].removeAttribute('style');
      continue;
    }

    conversationsList[x].style.display = 'none';
  }

  if(counter === 0) document.getElementById('messengerBlockEmptySearch').style.display = 'block';
}

/****************************************************************************************************/
