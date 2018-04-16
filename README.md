# Ajax загрузчик, [выложиен в маркеплейс](https://marketplace.1c-bitrix.ru/solutions/jerff.ajax/)

## Ajax враппер для списков, форм - project.ajax:wrapper

- загружает формы, компаненты, без вызова всего тела страницы
- можно передавать параметр PARAM
- позволяет последовательно загружать элементы с других компанентов (с пагинацией)
- фильтр по параметру, для списка

```php
$APPLICATION->IncludeComponent("project.ajax:wrapper", ".default", array(
    'PARAM' => array(
        'section' => 1,
        'element' => 1,
    )
));
```

![primer1.png](images/primer1.png)
![primer2.png](images/primer2.png)


```php
$APPLICATION->IncludeComponent("project.ajax:wrapper", "develop.webform", array());
```

## Генерация архива исходных кодов
- для версионности необходимо устанавливать тег версий 1.0.0, 1.1.0 и так далее
- установка
```sh
npm install
gulp
```