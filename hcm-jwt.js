(function() {

var h = document.getElementsByTagName('head')[0];

if (!document.getElementById('enmoei-injection-jquery')) {
    var j = document.createElement('script');
    j.type = 'text/javascript';
    j.src = '//code.jquery.com/jquery-3.4.1.min.js';
    j.id = 'enmoei-injection-jquery';
    h.appendChild(j);
}

if (!document.getElementById('enmoei-injection-moment')) {
    var m = document.createElement('script');
    m.type = 'text/javascript';
    m.src = '//momentjs.com/static/js/global.js';
    m.id = 'enmoei-injection-moment';
    h.appendChild(m);
}

var c = document.createElement('style');
c.type = 'text/css';
c.innerHTML = [
    'body {box-sizing:border-box}',
    'body *  {box-sizing:border-box}',
    'body.wait * {cursor:wait}',
    '.section-header {display:flex; justify-content:space-between}',
    '.section-header h6 {margin:0}',
    '.section-header .close {font-weight:bold}',
    '.section-header + .section-body {margin-top:10px}',
    '#api-container * {font-family:\'맑은 고딕\'; font-size:12px}',
    '#api-container {z-index:1000; position:fixed; top:6%; left:50%; width:40%; margin:0 0 0 -20%; padding:10px; overflow-y:auto; background-color:#fff; box-shadow:0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 20px 10px rgba(0,0,0,0.5)}',
    '#api-container a:link, #data-container a:link {color:#999; text-decoration:none}',
    '#api-container a:visited, #data-container a:visited {color:#999; text-decoration:none}',
    '#api-container a:hover, #data-container a:hover {color:#4263eb}',
    '#api-container a:active, #data-container a:active {color:#999; text-decoration:none}',
    '#api-container [readonly] {background-color:#eee; border:1px solid #ccc}',
    '#api-container table {width:100%; border-collapse:collapse; border-spacing:0}',
    '#api-container table + table {margin-top:20px}',
    '#api-container th, #api-container td {border:1px solid #ccc; padding:3px}',
    '#api-container th[scope="row"] {text-align:left}',
    '#data-container {margin-top:1%; width:100%; height:91%; border:1px solid #ccc; padding:10px; overflow-y:auto}',
    '#data-container label span {font-weight:bold}',
    '#data-container #pre {width:100%; overflow:hidden; text-overflow:ellipsis}'
].join('');
h.appendChild(c);

setTimeout(function() {

$('body').append([
    '<div id="api-container">',
        '<div class="section-header">',
            '<h6></h6>',
            '<a href="javascript:;" onclick="$(\'#api-container\').remove()" class="close">X</a>',
        '</div>',
        '<div class="section-body">',
            '<table>',
                '<colgroup>',
                    '<col style="width:230px" />',
                    '<col />',
                '</colgroup>',
                '<thead>',
                    '<tr>',
                        '<th>JWT</th>',
                        '<td>',
                            '<input type="text" id="jwt" style="width:89.5%" readonly="readonly" />',
                            '<button type="button" style="width:8.5%; margin-left:1.6%" onclick="RestApi.copyJWT()">Copy</button>',
                        '</td>',
                    '</tr>',
                    '<tr>',
                        '<th>Common Feature REST API Path</th>',
                        '<td>',
                            '<input type="text" id="api-path" style="width:89.5%" placeholder="호출할 API Path를 입력하세요." />',
                            '<button type="button" style="width:8.5%; margin-left:1.6%" onclick="RestApi.callApi(\'\', $(\'#api-path\').val())">호출</button>',
                        '</td>',
                    '</tr>',
                '</thead>',
            '</table>',
        '</div>',
        '<div id="data-container" style="display:none">',
            '<label></label>',
            '<div id="pre"></div>',
        '</div>',
    '</div>'
].join(''));

window.RestApi = {
    RequestHeader: {
         'Authorization': null
        ,'REST-Framework-Version': 4
        ,'Content-Type': 'application/vnd.oracle.adf.resourceitem+json'
//        ,'Accept': 'application/vnd.oracle.adf.resourceitem+json,application/vnd.oracle.adf.error+json'
    },
    callApi: function(task, apiPath) { // REST API 호출

        if (!RestApi.RequestHeader.Authorization) {
            var t = $('#jwt'), v = $.trim(t.val());
            if (v) {
                RestApi.RequestHeader.Authorization = 'Bearer ' + v;
            } else {
                alert('JWT 값이 없습니다.\n\n최초 스크립트를 다시 실행해주세요.');
                t.focus();
                return;
            }
        }
        if (!$.trim(apiPath)) {
            alert('API Path가 없습니다.');
            return;
        }

        $('body').toggleClass('wait', true);

        console.log('callApi begin', moment().format('YYYY-MM-DD HH:mm:ss.SSS'));
        $.get({
            url: apiPath,
            headers: RestApi.RequestHeader,
            timeout: 30000,
            success: function(data) {
                console.log('callApi end  ', moment().format('YYYY-MM-DD HH:mm:ss.SSS'));
                console.log('callApi success', arguments);

                var html = JSON.stringify(data, '', '    ').replace(/"(http[^"]*)"/g, '"<a href=\"javascript:RestApi.callApi(\'\', \'$1\')\">$1</a>"');

                $('#data-container label').html((task ? 'Task : <span>' + task + '</span>, ' : '') + 'API Path : <span>' + apiPath + '</span>');
                $('#data-container #pre').html(html.replace(/\r|\n/g, '<br>').replace(/\s{4}/g, '&nbsp; &nbsp; '));
                $('#data-container').show();
                $('body').toggleClass('wait', false);
            },
            error: function(data) {
                console.log('callApi error', arguments);
                alert('오류가 발생하였습니다.\n\nStatus Code : ' + data.status);
                $('body').toggleClass('wait', false);
            },
            complete: function() {
                console.log('callApi complete', arguments);
            }
        });
    },
    copyJWT: function() {
        $('#jwt').select();
        document.execCommand('copy');
    }
};

$.get({
    url: '/fscmRestApi/tokenrelay',
    timeout: 30000,
    success: function(data) {
        console.log('retrieveToken success', arguments);

        if ($.isPlainObject(data)) {
            $('#jwt').val(data.access_token);
            RestApi.RequestHeader.Authorization = 'Bearer ' + data.access_token;
        } else {
            alert('JWT 발급중 오류가 발생했습니다.');
        }
    },
    error: function() {
        console.log('retrieveToken error', arguments);
    },
    complete: function() {
        console.log('retrieveToken complete', arguments);
    }
});

}, 3000); // jquery.js 로딩 기다림

})();
