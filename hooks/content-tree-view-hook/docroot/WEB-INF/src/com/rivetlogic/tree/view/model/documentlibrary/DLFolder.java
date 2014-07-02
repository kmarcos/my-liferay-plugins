package com.rivetlogic.tree.view.model.documentlibrary;

import com.liferay.portal.kernel.repository.model.Folder;

import java.io.Serializable;


public class DLFolder implements Serializable{

    private static final long serialVersionUID = 1L;
    private long folderId;
    private String name = "";
    private long parentFolderId;
    private long repositoryId;
    private boolean deletePermission;
    private boolean updatePermission;
    
    public DLFolder(Folder folder){
        this.setFolderId(folder.getFolderId());
        this.setName(folder.getName());
        this.setParentFolderId(folder.getParentFolderId());
        this.setRepositoryId(folder.getRepositoryId());
        this.deletePermission = false;
        this.updatePermission = false;
    }
    
    public long getFolderId() {
        return folderId;
    }
    public void setFolderId(long folderId) {
        this.folderId = folderId;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public long getParentFolderId() {
        return parentFolderId;
    }
    public void setParentFolderId(long parentFolderId) {
        this.parentFolderId = parentFolderId;
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
    public void setDeletePermission(boolean hasDeletePermission) {
        this.deletePermission = hasDeletePermission;
    }
    public boolean isUpdatePermission() {
        return updatePermission;
    }
    public void setUpdatePermission(boolean hasUpdatePermission) {
        this.updatePermission = hasUpdatePermission;
    }
}
