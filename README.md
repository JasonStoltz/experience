experience.js
==========

Adobe Test and Target doesn't really have a nice API for dynamically including content, so this wraps it to provide that.

What T&T wants you to do is simply define an "mbox" div on a page, call them and tell them the id of that div, and they handle populating content to that div.

What I prefer to do is simply make a service call to T&T, have them give me some data/configuration back, and I will handle rendering content, however I see fit.
