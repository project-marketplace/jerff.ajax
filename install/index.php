<?php

if (!defined('\Project\Tools\Modules\IS_START')) {
    include_once(dirname(__DIR__) . '/project.tools/modules/install.php');
}

use Bitrix\Main\Localization\Loc,
    Project\Tools\Modules;

IncludeModuleLangFile(__FILE__);

class project_ajax extends CModule {

    public $MODULE_ID = 'project.ajax';

    use Modules\Install;

    function __construct() {
        $this->setParam(__DIR__, 'PROJECT_AJAX');
        $this->MODULE_NAME = Loc::getMessage('PROJECT_AJAX_NAME');
        $this->MODULE_DESCRIPTION = Loc::getMessage('PROJECT_AJAX_DESCRIPTION');
        $this->PARTNER_NAME = Loc::getMessage('PROJECT_AJAX_PARTNER_NAME');
        $this->PARTNER_URI = Loc::getMessage('PROJECT_AJAX_PARTNER_URI');
    }

    /*
     * InstallFiles
     */

    public function InstallFiles($arParams = array()) {
        CopyDirFiles($_SERVER['DOCUMENT_ROOT'] . '/local/modules/' . $this->MODULE_ID . '/install/components/', $_SERVER['DOCUMENT_ROOT'] . '/local/components/', true, true);
        CopyDirFiles($_SERVER['DOCUMENT_ROOT'] . '/local/modules/' . $this->MODULE_ID . '/install/site/public/project.ajax', $_SERVER['DOCUMENT_ROOT'] . '/project.ajax/', true, true);
        CopyDirFiles($_SERVER['DOCUMENT_ROOT'] . '/local/modules/' . $this->MODULE_ID . '/install/themes/', $_SERVER['DOCUMENT_ROOT'] . '/local/themes/' . $this->MODULE_ID . '/', true, true);
    }

    public function UnInstallFiles() {
        DeleteDirFiles($_SERVER['DOCUMENT_ROOT'] . '/local/modules/' . $this->MODULE_ID . '/install/components/', $_SERVER['DOCUMENT_ROOT'] . '/local/components/');
        DeleteDirFiles($_SERVER['DOCUMENT_ROOT'] . '/local/modules/' . $this->MODULE_ID . '/install/site/public/project.ajax', $_SERVER['DOCUMENT_ROOT'] . '/project.ajax/');
        DeleteDirFiles($_SERVER['DOCUMENT_ROOT'] . '/local/modules/' . $this->MODULE_ID . '/install/themes/', $_SERVER['DOCUMENT_ROOT'] . '/local/themes/' . $this->MODULE_ID . '/'); //css
    }

}
