var width = 1;
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

	steem.api.getVestingDelegations(account, 0, 1000, function(err, result)
	{
		var names = [];
		var follow = [];

		for(var i = 0; i < result.length; i++)
		{
			names.push(result[i].delegatee);

			steem.api.getFollowCount(names[i], function(err2, followCount)
			{
				follow.push(followCount);
			});
		}

		steem.api.getDynamicGlobalProperties(function(err3, globalProperties)
		{
			steem.api.getAccounts(names, function(err4, accountDetails)
			{
				var total_vesting_shares = globalProperties.total_vesting_shares.split(' ')[0];
				var total_vesting_fund_steem = globalProperties.total_vesting_fund_steem.split(' ')[0];

				var one_day = 24 * 60 * 60 * 1000;

				var table_content = `
					<table>
						<tr>
							<th> Name </th>
							<th> Owned SP </th>
							<th> Delegated by @${account} </th>
							<th> Total Delegated </th>
							<th> Reputation </th>
							<th> Days Since Post </th>
							<th> Days Since Comment </th>
							<th> Days Since Vote </th>
							<th> Number of Posts </th>
							<th> Followers </th>
							<th> Followings </th>
						</tr>`;

				for(var i = 0; i < names.length; i++)
				{
					var owned_vesting_shares = accountDetails[i].vesting_shares.split(' ')[0];
					var delegated = result[i].vesting_shares.split(' ')[0];
					var total_delgated = accountDetails[i].received_vesting_shares.split(' ')[0] - accountDetails[i].delegated_vesting_shares.split(' ')[0];

					var today = Date.now();
					var last_post = new Date(accountDetails[i].last_post);
					var last_root = new Date(accountDetails[i].last_root_post);
					var last_vote = new Date(accountDetails[i].last_vote_time);

					var followersCount = 0;
					var followingsCount = 0;

					for(var j = 0; j < names.length; j++)
					{
						if(result[i].delegatee === follow[j].account)
						{
							followersCount = follow[j].follower_count;
							followingsCount = follow[j].following_count;
						}
					}

					table_content += `
						<tr>
							<td> ${result[i].delegatee} </td>
							<td> ${Math.round(steem.formatter.vestToSteem(owned_vesting_shares, total_vesting_shares, total_vesting_fund_steem))} </td>
							<td> ${Math.round(steem.formatter.vestToSteem(delegated, total_vesting_shares, total_vesting_fund_steem))} </td> 
							<td> ${Math.round(steem.formatter.vestToSteem(total_delgated, total_vesting_shares, total_vesting_fund_steem))} </td>
							<td> ${steem.formatter.reputation(accountDetails[i].reputation)} </td>
							<td> ${Math.round((today - last_root.getTime()) / one_day)} </td>
							<td> ${Math.round((today - last_post.getTime()) / one_day)} </td>
							<td> ${Math.round((today - last_vote.getTime()) / one_day)} </td>
							<td> ${accountDetails[i].post_count} </td>
							<td> ${followersCount} </td>
							<td> ${followingsCount} </td>
						</tr>`;
				}

				table_content += `</table>`;
				document.getElementById("table").innerHTML = table_content;

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
			});
		});
	});
}