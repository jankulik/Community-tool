var followers = [];
var names = [];
var follow = [];
var table_content;
var width = 0;
var account_index = 0;

var input = document.getElementById("account_name");
input.addEventListener("keyup", function(event)
{
	if(event.keyCode === 13)
	{
		event.preventDefault();
		document.getElementById("button").click();
	}
});

function submit()
{
	var account = document.getElementById("account_name").value;
	followers = [];

	var bar = document.getElementById("bar");
	var id = setInterval(frameStart, 10);

	bar.style.width = width + '%';
	bar.innerHTML = width * 1 + '%';
	bar.style.display = 'block';

	function frameStart()
	{
		if(width >= 5)
			clearInterval(id);
		else
		{
			width++; 
			bar.style.width = width + '%'; 
			bar.innerHTML = width * 1 + '%';
		}
	}

	steem.api.getFollowCount(account, function(err, followCount)
	{
		getFollowers(account, '', followCount.follower_count);
	});
}

function getFollowers(account, start, followersCount)
{
	steem.api.getFollowers(account, start, 'blog', 1000, function(err, followersResult)
	{
		for(var i = 0; i < followersResult.length; i++)
			followers.push(followersResult[i].follower);
	});

	if(followers.length < followersCount)
		setTimeout(function(){getFollowers(account, followers[followers.length - 1], followersCount);}, 500);
	else
		getAccounts(0);
}

function getAccounts(start)
{
	var bar = document.getElementById("bar");
	var id = setInterval(frame, 10);

	if(start == 0)
	{
		names = followers;
		follow = [];
		account_index = 0;

		width = 5;
		bar.style.width = width + '%'; 
		bar.innerHTML = width * 1 + '%';
		bar.style.display = 'block';

		table_content = `
			<table id="table">
			<tr>
				<th> Name </th>
				<th> Total SP </th>
				<th> Delegated SP </th>
				<th> Reputation </th>
				<th> Days Since Post </th>
				<th> Days Since Comment </th>
				<th> Days Since Vote </th>
				<th> Number of Posts </th>
				<th> Followers </th>
				<th> Followings </th>
			</tr>
			</table>`;

		document.getElementById("table_span").innerHTML = table_content;
	}

	function frame()
	{
		if(width >= 99 || width >= ((start + 100) / names.length) * 100)
			clearInterval(id);
		else
		{
			width++; 
			bar.style.width = width + '%'; 
			bar.innerHTML = width * 1 + '%';
		}
	}

	var table = document.getElementById("table");

	var subNames = [];
	for(var i = start; (i < (start + 99)) && (i < names.length); i++)
	{
		subNames.push(names[i]);

		steem.api.getFollowCount(names[i], function(err, followCount)
		{
			follow.push(followCount);
		});
	}

	steem.api.getDynamicGlobalProperties(function(err2, globalProperties)
	{
		steem.api.getAccounts(subNames, function(err3, accountDetails)
		{
			var total_vesting_shares = globalProperties.total_vesting_shares.split(' ')[0];
			var total_vesting_fund_steem = globalProperties.total_vesting_fund_steem.split(' ')[0];

			var one_day = 24 * 60 * 60 * 1000;

			for(var i = 0; i < subNames.length; i++)
			{
				if(accountDetails[i] !== undefined)
				{
					account_index++;

					var account_vesting_shares = parseInt(accountDetails[i].vesting_shares.split(' ')[0]);
					var delegated_vesting_shares = parseInt(accountDetails[i].delegated_vesting_shares.split(' ')[0]);
					var total_delegated_vesting_shares = parseInt(accountDetails[i].received_vesting_shares.split(' ')[0] - accountDetails[i].delegated_vesting_shares.split(' ')[0]);
					var total_account_vesting_shares = account_vesting_shares + total_delegated_vesting_shares;

					var today = Date.now();
					var last_post = new Date(accountDetails[i].last_post);
					var last_root = new Date(accountDetails[i].last_root_post);
					var last_vote = new Date(accountDetails[i].last_vote_time);

					var followersCount = 0;
					var followingsCount = 0;

					for(var j = 0; j < follow.length; j++)
					{
						if(subNames[i] == follow[j].account)
						{
							followersCount = follow[j].follower_count;
							followingsCount = follow[j].following_count;
						}
					}

					var row = table.insertRow(account_index);
					var cell1 = row.insertCell(0);
					var cell2 = row.insertCell(1);
					var cell3 = row.insertCell(2);
					var cell4 = row.insertCell(3);
					var cell5 = row.insertCell(4);
					var cell6 = row.insertCell(5);
					var cell7 = row.insertCell(6);
					var cell8 = row.insertCell(7);
					var cell9 = row.insertCell(8);
					var cell10 = row.insertCell(9);

					cell1.innerHTML = accountDetails[i].name;
					cell2.innerHTML = Math.round(steem.formatter.vestToSteem(total_account_vesting_shares, total_vesting_shares, total_vesting_fund_steem));
					cell3.innerHTML = Math.round(steem.formatter.vestToSteem(delegated_vesting_shares, total_vesting_shares, total_vesting_fund_steem));
					cell4.innerHTML = steem.formatter.reputation(accountDetails[i].reputation);
					cell5.innerHTML = Math.round((today - last_root.getTime()) / one_day);
					cell6.innerHTML = Math.round((today - last_post.getTime()) / one_day);
					cell7.innerHTML = Math.round((today - last_vote.getTime()) / one_day);
					cell8.innerHTML = accountDetails[i].post_count;
					cell9.innerHTML = followersCount;
					cell10.innerHTML = followingsCount;
				}
			}

			if((start + 100) > names.length)
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
				setTimeout(function(){getAccounts(start + 100);}, 35000);
		});
	});
}