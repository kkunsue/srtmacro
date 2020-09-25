$(document).ready(function () {

    const isRunning = "on" === sessionStorage.getItem('macro.status');

    if (!isRunning) {
        helpers.createStartTrigger().click(macro.start).appendTo(helpers.getParentOfTriggers());
        return;
    }

    helpers.createStopTrigger().click(macro.stop).appendTo(helpers.getParentOfTriggers());
    helpers.markIdOnCurrentItems();

    const currentItemIds = helpers.getCurrentItemIds();
    const existsItemIds = sessionStorage.getItem('macro.exists').split(",");

    const difference = currentItemIds.filter(x => !existsItemIds.includes(x));

    if (difference.length > 0) {
        sessionStorage.removeItem('macro.status');
        sessionStorage.removeItem('macro.keyword');
        sessionStorage.removeItem('macro.exists');

        const message = {
            type: 'got',
            names: $(difference).map(helpers.getItemName).get(),
            count: difference.length
        };

        chrome.extension.sendMessage(message, $.noop);
    } else {
        setTimeout(function () {
            location.reload();
        }, 20000);
    }
});

const helpers = (function () {

    const extractIdFromElement = function () {
        return extractId(this.href);
    }

    const extractId = function extractId(str) {
        return str.match(/goods_code=(\d+)/)[1];
    }

    return {
        createStartTrigger: function () {
            return $('<a href="#" style="margin-left:5px;"><img src="' + chrome.extension.getURL('images/btn_start.png') + '" alt="start"></a>');
        },
        createStopTrigger: function () {
            return $('<a href="#" style="margin-left:5px;"><img src="' + chrome.extension.getURL('images/btn_stop.png') + '" alt="stop"></a>');
        },
        getParentOfTriggers: function () {
            return ".reserve_ban_rt";
        },
        getCurrentItemIds: function () {
            return $(".prodct_info > a").map(extractIdFromElement).get();
        },
        markIdOnCurrentItems: function () {
            $(".prodct_info > a").each(function () {
                $(this).attr("id", extractId(this.href));
            })
        },
        getItemName: function () {
            const id = this;
            return $("a[id=" + id + "]").find(".tama_txt01").text();
        }
    }
})();

const macro = (function () {

    return {
        start: function (keyword) {
            sessionStorage.setItem('macro.status', "on");
            sessionStorage.setItem("macro.keyword", $.trim(keyword));
            const currentItemIds = helpers.getCurrentItemIds();
            sessionStorage.setItem("macro.exists", currentItemIds.join(","))

            location.reload();
        },
        stop: function () {
            alert("매크로를 중지합니다.");
            sessionStorage.removeItem('macro.status');
            sessionStorage.removeItem("macro.keyword");
            sessionStorage.removeItem("macro.exists");

            location.reload();
        }
    }
})();