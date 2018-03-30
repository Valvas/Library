/****************************************************************************************************/

function addAccountToService(event)
{
  var x = 0;
  var target = event.target;

  var getParentLoop = () =>
  {
    target = target.parentNode;
    if(target.getAttribute('class') != 'account') getParentLoop();
  }

  if(target.getAttribute('class') != 'account') getParentLoop();

  var membersAddedToTheService = document.getElementById('added').children;

  var x = 0;

  var found = false;

  var checkIfAccountIsAlreadyInTheList = () =>
  {
    if(membersAddedToTheService[x].getAttribute('tag') == target.getAttribute('name')) found = true;

    if(membersAddedToTheService[x += 1] != undefined) checkIfAccountIsAlreadyInTheList();
  }

  if(membersAddedToTheService[x] != undefined) checkIfAccountIsAlreadyInTheList();

  if(found == false)
  {
    var member              = document.createElement('div');
    var email               = document.createElement('div');
    var values              = document.createElement('div');
    var remove              = document.createElement('button');

    var commentRightTrue    = document.createElement('div');
    var commentRightFalse   = document.createElement('div');
    var uploadRightTrue     = document.createElement('div');
    var uploadRightFalse    = document.createElement('div');
    var downloadRightTrue   = document.createElement('div');
    var downloadRightFalse  = document.createElement('div');
    var removeRightTrue     = document.createElement('div');
    var removeRightFalse    = document.createElement('div');

    commentRightTrue        .setAttribute('class', 'true inactive');
    uploadRightTrue         .setAttribute('class', 'true inactive');
    downloadRightTrue       .setAttribute('class', 'true inactive');
    removeRightTrue         .setAttribute('class', 'true inactive');

    commentRightFalse       .setAttribute('class', 'false active');
    uploadRightFalse        .setAttribute('class', 'false active');
    downloadRightFalse      .setAttribute('class', 'false active');
    removeRightFalse        .setAttribute('class', 'false active');

    member                  .setAttribute('class', 'account');
    email                   .setAttribute('class', 'name');
    values                  .setAttribute('class', 'values');
    remove                  .setAttribute('class', 'remove');

    values                  .setAttribute('name', 'values');

    member                  .setAttribute('tag', target.getAttribute('name'));

    email                   .innerText = target.children[0].innerText;

    remove                  .innerText = 'Retirer';

    remove                  .addEventListener('click', removeAccountFromServiceMembers);

    commentRightTrue        .innerHTML = `<i class='far fa-check-circle'></i>`;
    uploadRightTrue         .innerHTML = `<i class='far fa-check-circle'></i>`;
    downloadRightTrue       .innerHTML = `<i class='far fa-check-circle'></i>`;
    removeRightTrue         .innerHTML = `<i class='far fa-check-circle'></i>`;
    commentRightFalse       .innerHTML = `<i class='far fa-times-circle'></i>`;
    uploadRightFalse        .innerHTML = `<i class='far fa-times-circle'></i>`;
    downloadRightFalse      .innerHTML = `<i class='far fa-times-circle'></i>`;
    removeRightFalse        .innerHTML = `<i class='far fa-times-circle'></i>`;

    commentRightTrue        .setAttribute('tag', 'false');
    uploadRightTrue         .setAttribute('tag', 'false');
    downloadRightTrue       .setAttribute('tag', 'false');
    removeRightTrue         .setAttribute('tag', 'false');

    commentRightFalse       .setAttribute('tag', 'true');
    uploadRightFalse        .setAttribute('tag', 'true');
    downloadRightFalse      .setAttribute('tag', 'true');
    removeRightFalse        .setAttribute('tag', 'true');

    commentRightTrue        .addEventListener('click', activateCommentRight);
    uploadRightTrue         .addEventListener('click', activateUploadRight);
    downloadRightTrue       .addEventListener('click', activateDownloadRight);
    removeRightTrue         .addEventListener('click', activateRemoveRight);

    commentRightFalse       .addEventListener('click', desactivateCommentRight);
    uploadRightFalse        .addEventListener('click', desactivateUploadRight);
    downloadRightFalse      .addEventListener('click', desactivateDownloadRight);
    removeRightFalse        .addEventListener('click', desactivateRemoveRight);

    values                  .appendChild(commentRightTrue);
    values                  .appendChild(commentRightFalse);
    values                  .appendChild(uploadRightTrue);
    values                  .appendChild(uploadRightFalse);
    values                  .appendChild(downloadRightTrue);
    values                  .appendChild(downloadRightFalse);
    values                  .appendChild(removeRightTrue);
    values                  .appendChild(removeRightFalse);

    member                  .appendChild(email);
    member                  .appendChild(values);
    member                  .appendChild(remove);

    document.getElementById('added').appendChild(member);
  }
}

/****************************************************************************************************/