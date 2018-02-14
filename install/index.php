<?php

if (!defined('\Project\Tools\Modules\IS_START')) {
    include_once(dirname(__DIR__) . '/project.tools/include.php');
}

use Bitrix\Main\Localization\Loc,
    Project\Tools\Modules;

IncludeModuleLangFile(__FILE__);

class jerff_ajax extends CModule {

    public $MODULE_ID = 'jerff.ajax';
    public $MODULE_NAME;
    public $MODULE_DESCRIPTION;
    public $MODULE_VERSION;
    public $MODULE_VERSION_DATE;

    use Modules\Install;

    function __construct() {
        $this->setParam(__DIR__, 'JERFF_AJAX');
        $this->MODULE_NAME = Loc::getMessage('JERFF_AJAX_NAME');
        $this->MODULE_DESCRIPTION = Loc::getMessage('JERFF_AJAX_DESCRIPTION');
        $this->PARTNER_NAME = Loc::getMessage('JERFF_AJAX_PARTNER_NAME');
        $this->PARTNER_URI = Loc::getMessage('JERFF_AJAX_PARTNER_URI');
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
        CopyDirFiles($_SERVER['DOCUMENT_ROOT'] . '/local/modules/' . $this->MODULE_ID . '/install/components/', $_SERVER['DOCUMENT_ROOT'] . '/local/components/', true, true);
        CopyDirFiles($_SERVER['DOCUMENT_ROOT'] . '/local/modules/' . $this->MODULE_ID . '/install/site/public/project.ajax', $_SERVER['DOCUMENT_ROOT'] . '/project.ajax/', true, true);
    }

    public function UnInstallFiles() {
        DeleteDirFiles($_SERVER['DOCUMENT_ROOT'] . '/local/modules/' . $this->MODULE_ID . '/install/components/', $_SERVER['DOCUMENT_ROOT'] . '/local/components/');
        DeleteDirFiles($_SERVER['DOCUMENT_ROOT'] . '/local/modules/' . $this->MODULE_ID . '/install/site/public/project.ajax', $_SERVER['DOCUMENT_ROOT'] . '/project.ajax/');
    }

}
