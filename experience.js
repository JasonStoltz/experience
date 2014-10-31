/**
 *
 * Adobe Test and Target doesn't really have a nice API for dynamically including content, so this wraps it to provide that.
 *
 * What T&T wants you to do is simply define an "mbox" div on a page, call them and tell them the id of that div, and they handle
 * populating content to that div.
 *
 * What I prefer to do is simply make a service call to T&T, have them give me some data/configuration back, and I will handle rendering
 * content, however I see fit.
 * 
 */
window.experience = (function(){

    'use strict';

    var experience = {

        /**
         * This is the only public method we should need to deal with.
         * 
         * Wrapper around mboxUpdate that does the following in addition:
         * 1) Return a promise so that we can have callback
         * 2) Handles calling of mboxDefine
         *
         * @param  {String} Mbox name
         * @param  {String...} Any number of string values that look like "route_distance=399", use the function is this.params to assist in creation
         * @return {Promise} A promise that will receive JSON from Test and Target
         */
        load: function() {
            
            var args = Array.prototype.slice.call(arguments, 0);
            var mboxName = args[0];
            var $mbox = this.mboxes[mboxName];


            //T&T needs to have an div to render the returned content to ... we are creating them dynamically as they're needed, rather than placing
            //on the page staticly
            if (!$mbox) {
                $mbox = $('<div id="' + mboxName + '">');
                $('body').append($mbox);
                this.mboxes[mboxName] = $mbox;
                mboxDefine(mboxName, mboxName); // defines a receiving <div> and mBox name!
            }


            //Because mbox.js gives us no real way of knowing when the request is done, we're using JSONP-like strategy.
            //We create a unique id like "OTA_WIDGET_1_MBOX12312314" and pass along as an "mbox parameter" on our T&T call.
            //T&T then returns JSONP and adds it to the page, so something like this:
            //  <script>
            //      experience.resolve("OTA_WIDGET_1_MBOX12312314", /*JSON here*/)
            //  </script>
            //  
            //Our script knows which promise to resolve based on that unique id: "OTA_WIDGET_1_MBOX12312314"
            var callbackid = mboxName + new Date().getTime();
            var deferred = $.Deferred();
            this.deferreds[callbackid] = deferred;
            args.push('callbackid=' + callbackid);

            //Just want to exit this event loop before returning so that we know all of our callbacks are set up.
            setTimeout(function(){
                mboxUpdate.apply(this, args);
            });
            return deferred.promise();
        },

        /**
         * Helper functions for creating params that Test and Target will evaluate to determine which experience to show.
         * Use when making calls to "load"
         * @type {Object}
         */
        params: {
            
        },

        /**
         * Response from T&T needs to call this in order to resolve promise. So this call will actually be located
         * in T&T
         * 
         * @param  {String} callbackid id that was passed to T&T that corresponds to experience.load call
         * @param  {Object} json response
         */
        resolve: function(callbackid, options) {
            this.deferreds[callbackid].resolve(options);
            delete this.deferreds[callbackid]; //Don't hold on to a reference
        },

        deferreds: {},
        mboxes: {}
        
    };

    return experience;
})();

