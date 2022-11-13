var tag;
var account_index = 0;
var today = Date.now();
var authors = [];

var width = 1;
var input = document.getElementById("tag_name");
input.addEventListener("keyup", function(event)
{
  if(event.keyCode === 13)
  {
    event.preventDefault();
    document.getElementById("button").click();
  }
});

function getAccountsByTag(startAccount, startPermlink)
{
  var query;

  if(startAccount !== '' && startPermlink !== '')
  {
    query = {
      tag: tag,
      limit: 100,
      start_author: startAccount,
      start_permlink: startPermlink,
    };
  }
  else
  {
    query = {
      tag: tag,
      limit: 100,
    };
  }

  steem.api.getDiscussionsByCreated(query, function(err, result)
  {
    console.log(result);
    var last_post;

    var table = document.getElementById("table");
    var one_day = 24 * 60 * 60 * 1000;

    for(var i = 0; i < result.length; i++)
    {
      last_post = new Date(result[i].created);

      if(Math.round((today - last_post.getTime()) / one_day) < 90)
      {
        var already_present = false;

        for(var j = 0; j < authors.length; j++)
        {
          if(result[i].author === authors[j])
            already_present = true;
        }

        if(!already_present)
        {
          authors.push(result[i].author);
          account_index++;
          var row = table.insertRow(account_index);
          var cell = row.insertCell(0);
          cell.innerHTML = result[i].author;
        }
      }
    }

    if(Math.round((today - last_post.getTime()) / one_day) > 90)
    {
      bar.style.width = 100 + '%'; 
      bar.innerHTML = 100 * 1 + '%';
      bar.style.display = 'none';

      $("table").tableExport({
        headings: true,                    // (Boolean), display table headings (th/td elements) in the <thead>
        footers: true,                     // (Boolean), display table footers (th/td elements) in the <tfoot>
        formats: ["xlsx", "xls", "csv", "txt"],    // (String[]), filetypes for the export
        fileName: "id",                    // (id, String), filename for the downloaded file
        bootstrap: true,                   // (Boolean), style buttons using bootstrap
        position: "top",                // (top, bottom), position of the caption element relative to table
        ignoreRows: null,                  // (Number, Number[]), row indices to exclude from the exported file(s)
        ignoreCols: null,                  // (Number, Number[]), column indices to exclude from the exported file(s)
        ignoreCSS: ".tableexport-ignore",  // (selector, selector[]), selector(s) to exclude from the exported file(s)
        emptyCSS: ".tableexport-empty",    // (selector, selector[]), selector(s) to replace cells with an empty string in the exported file(s)
        trimWhitespace: true              // (Boolean), remove all leading/trailing newlines, spaces, and tabs from cell text in the exported file(s)
      });
    }
    else
      setTimeout(function(){getAccountsByTag(result[result.length - 1].author, result[result.length - 1].permlink);}, 100);
  });
}

function submit()
{
  tag = document.getElementById("tag_name").value;
  account_index = 0;
  authors = [];

  var bar = document.getElementById("bar"); 
  var id = setInterval(frame, 10);

  width = 1;
  bar.style.width = width + '%'; 
  bar.innerHTML = width * 1 + '%';  
  bar.style.display = 'block';

  function frame()
  {
    if(width >= 99)
      clearInterval(id);
    else
    {
      width++; 
      bar.style.width = width + '%'; 
      bar.innerHTML = width * 1 + '%';
    }
  }

  table_content = `
    <table id="table">
      <tr>
        <th> Name </th>
      </tr>
    </table>`;

  document.getElementById("table_span").innerHTML = table_content;

  getAccountsByTag('', '');
}
