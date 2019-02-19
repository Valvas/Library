/****************************************************************************************************/

function updateArticle()
{
  if(document.getElementById('mainNewsBlockArticle') == null) return;

  location = `/news/update/${document.getElementById('mainNewsBlockArticle').getAttribute('name')}`;
}

/****************************************************************************************************/