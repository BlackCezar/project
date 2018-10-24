var now = (new Date());
var month = ['', 'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декаря'];
$('.today').text(
   'Сегодня: ' + now.getDate() + ' ' + month[now.getMonth()] + ' ' + now.getFullYear()
);