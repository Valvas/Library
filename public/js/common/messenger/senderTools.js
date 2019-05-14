/****************************************************************************************************/

function messengerPickEmoji()
{
  return; // To remove when emojis will work

  if(document.getElementById('messengerSenderToolsEmoji')) return;

  const container             = document.createElement('div');
  const containerWrapper      = document.createElement('div');
  const containerWrapperList  = document.createElement('div');
  const containerReturn       = document.createElement('div');
  const containerReturnButton = document.createElement('button');

  container             .setAttribute('id', 'messengerSenderToolsEmoji');

  container             .setAttribute('class', 'messenger__sender__tools__emoji-container');
  containerWrapper      .setAttribute('class', 'messenger__sender__tools__emoji-container__wrapper');
  containerWrapperList  .setAttribute('class', 'messenger__sender__tools__emoji-container__wrapper__list');
  containerReturn       .setAttribute('class', 'messenger__sender__tools__emoji-container__return');

  const emojiCodes =
  [
    0x1F600, 0x1F601, 0x1F602, 0x1F603, 0x1F604, 0x1F605, 0x1F606, 0x1F607, 0x1F608, 0x1F609,
    0x1F610, 0x1F611, 0x1F612, 0x1F613, 0x1F614, 0x1F615, 0x1F616, 0x1F617, 0x1F618, 0x1F619,
    0x1F620, 0x1F601, 0x1F601, 0x1F601, 0x1F601, 0x1F601, 0x1F601, 0x1F601, 0x1F601, 0x1F601,
    0x1F630, 0x1F601, 0x1F601, 0x1F601, 0x1F601, 0x1F601, 0x1F601, 0x1F601, 0x1F601, 0x1F601,
    0x1F640, 0x1F641, 0x1F642, 0x1F643, 0x1F644, 0x1F645, 0x1F60A, 0x1F60B, 0x1F60C, 0x1F60D,
    0x1F60E, 0x1F60F, 0x1F61A, 0x1F61B, 0x1F61C, 0x1F61D, 0x1F61E, 0x1F61F, 0x1F62A, 0x1F62B,
    0x1F62C, 0x1F62D, 0x1F62E, 0x1F62F, 0x1F910, 0x1F911, 0x1F912, 0x1F913, 0x1F914, 0x1F915,
    0x1F917, 0x1F922, 0x1F923, 0x1F924, 0x1F927, 0x1F928, 0x1F92B, 0x1F92D, 0x1F973, 0x1F974,
    0x1F975, 0x1F976, 0x1F97A, 0x1F9D0
  ]

  for(let x = 0; x < emojiCodes.length; x++)
  {
    const currentEmoji = document.createElement('span');

    currentEmoji.innerText = String.fromCodePoint(emojiCodes[x]);

    currentEmoji.addEventListener('click', () =>
    {
      const value = ((event.target.innerText.charCodeAt(0) - 0xD800) * 0x400 + (event.target.innerText.charCodeAt(1) - 0xDC00) + 0x10000).toString('16');
      console.log(`${value} -> ${String.fromCodePoint('0x' + value)}`);
      //container.remove();
      //document.getElementById('messengerConversationBlock').getElementsByClassName('messengerConversationBlockContentSenderInput')[0].value += event.target.innerText;
    });

    containerWrapperList.appendChild(currentEmoji);
  }

  containerReturnButton .innerText = commonStrings.global.back;

  containerReturn       .appendChild(containerReturnButton);
  containerWrapper      .appendChild(containerWrapperList);
  container             .appendChild(containerWrapper);
  container             .appendChild(containerReturn);

  containerReturnButton .addEventListener('click', () =>
  {
    container.remove();
  });

  document.getElementById('messengerConversationBlock').appendChild(container);
}

/****************************************************************************************************/
