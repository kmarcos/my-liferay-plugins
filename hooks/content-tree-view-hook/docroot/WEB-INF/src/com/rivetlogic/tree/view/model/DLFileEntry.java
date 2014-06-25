package com.rivetlogic.tree.view.model;

import com.liferay.portal.kernel.repository.model.FileEntry;

import java.io.Serializable;

public class DLFileEntry implements Serializable{

    private static final long serialVersionUID = 1L;
    private long fileEntryId;
    private String title ="";
    private String description ="";
    private String version ="";
    private long folderId;
    private long repositoryId;
    private boolean deletePermission;
    private boolean updatePermission;
    
    public DLFileEntry(FileEntry fileEntry){
        this.fileEntryId = fileEntry.getFileEntryId();
        this.title = fileEntry.getTitle();
        this.description = fileEntry.getDescription();
        this.version = fileEntry.getVersion();
        this.folderId = fileEntry.getFileEntryId();
        this.repositoryId = fileEntry.getRepositoryId();
        this.deletePermission = false;
        this.updatePermission = false;
    }
    
    public long getFileEntryId() {
        return fileEntryId;
    }
    public void setFileEntryId(long fileEntryId) {
        this.fileEntryId = fileEntryId;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getVersion() {
        return version;
    }
    public void setVersion(String version) {
        this.version = version;
    }
    public long getFolderId() {
        return folderId;
    }
    public void setFolderId(long folderId) {
        this.folderId = folderId;
    }
    public long getRepositoryId() {
        return repositoryId;
    }
    public void setRepositoryId(long repositoryId) {
        this.repositoryId = repositoryId;
    }
    public boolean isDeletePermission() {
        return deletePermission;
    }
    public void setDeletePermission(boolean deletePermission) {
        this.deletePermission = deletePermission;
    }
    public boolean isUpdatePermission() {
        return updatePermission;
    }
    public void setUpdatePermission(boolean updatePermission) {
        this.updatePermission = updatePermission;
    }
}
