/****************************************************************************************************/

socket.on('prolongationAddedOnStoppage', (prolongationData) =>
{
  if(document.getElementById('locationContainer') === null) return;

  if(document.getElementById('locationContainer').getAttribute('name') !== prolongationData.record) return;

  if(document.getElementById('prolongationsList') === null) return;

  document.getElementById('prolongationsEmpty').removeAttribute('style');
  document.getElementById('prolongationsList').removeAttribute('style');

  if(document.getElementById('stoppageEndDate'))
  {
    document.getElementById('stoppageEndDate').innerText = prolongationData.end;
  }

  const prolongationBlock           = document.createElement('div');
  const prolongationBlockDates      = document.createElement('div');
  const prolongationBlockAttachment = document.createElement('div');

  prolongationBlock                 .setAttribute('class', 'element');
  prolongationBlockDates            .setAttribute('class', 'dates');
  prolongationBlockAttachment       .setAttribute('class', 'attachment');

  prolongationBlockDates            .innerHTML += `<div class="date"><div class="label">${appStrings.stoppageDetail.prolongationsBlock.datesSection.startDate}</div><div class="value">${prolongationData.start}</div></div>`;
  prolongationBlockDates            .innerHTML += `<div class="date"><div class="label">${appStrings.stoppageDetail.prolongationsBlock.datesSection.endDate}</div><div class="value">${prolongationData.end}</div></div>`;

  prolongationBlockAttachment       .innerText = prolongationData.attachment;

  prolongationBlockAttachment       .addEventListener('click', () =>
  {
    window.open(`/queries/stoppage/visualize-attachment/${prolongationData.record}/${prolongationData.uuid}`);
  });

  prolongationBlock                 .appendChild(prolongationBlockDates);
  prolongationBlock                 .appendChild(prolongationBlockAttachment);

  document.getElementById('prolongationsList').appendChild(prolongationBlock);
});

/****************************************************************************************************/
