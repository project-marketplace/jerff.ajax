<?

if (IsModuleInstalled('jerff.ajax')) {
    if (is_dir(__DIR__ . '/install/components'))
        $updater->CopyFiles("install/components", "components/");
}
