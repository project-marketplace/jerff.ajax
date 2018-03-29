<?php

if (!defined('\Project\Tools\Modules\IS_START')) {
    include_once(dirname(__DIR__) . '/project.tools/include.php');
}

use Bitrix\Main\Localization\Loc,
    Bitrix\Main\Application,
    Project\Tools\Modules;

IncludeModuleLangFile(__FILE__);

class jerff_ajax extends CModule {

    public $MODULE_ID = 'jerff.ajax';
    public $MODULE_NAME;
    public $MODULE_DESCRIPTION;
    public $MODULE_VERSION;
    public $MODULE_VERSION_DATE;
    public $PARTNER_NAME;
    public $PARTNER_URI;

    use Modules\Install;

    function __construct() {
        $this->setParam(__DIR__, 'JERFF_AJAX');
        $this->MODULE_NAME = GetMessage('JERFF_AJAX_NAME');
        $this->MODULE_DESCRIPTION = GetMessage('JERFF_AJAX_DESCRIPTION');
        $this->PARTNER_NAME = GetMessage('JERFF_AJAX_PARTNER_NAME');
        $this->PARTNER_URI = GetMessage('JERFF_AJAX_PARTNER_URI');
    }

    public function DoInstall() {
        $this->Install();
    }

    public function DoUninstall() {
        $this->Uninstall();
    }

    /*
     * InstallFiles
     */

    public function InstallFiles($arParams = array()) {
        CopyDirFiles(__DIR__ . '/components/', Application::getDocumentRoot() . '/bitrix/components/', true, true);
        CopyDirFiles(__DIR__ . '/site/public/project.ajax', Application::getDocumentRoot() . '/project.ajax/', true, true);
    }

    public function UnInstallFiles() {
        DeleteDirFiles(__DIR__ . '/components/', Application::getDocumentRoot() . '/bitrix/components/');
        DeleteDirFiles(__DIR__ . '/site/public/project.ajax', Application::getDocumentRoot() . '/project.ajax/');
    }

}
