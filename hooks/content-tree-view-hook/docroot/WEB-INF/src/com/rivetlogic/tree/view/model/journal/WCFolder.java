package com.rivetlogic.tree.view.model.journal;

import com.liferay.portlet.journal.model.JournalArticle;
import com.liferay.portlet.journal.model.JournalFolder;

import java.io.Serializable;

public class WCFolder implements Serializable {

    private static final long serialVersionUID = 1L;
    private long folderId;
    private String name = "";
    private long parentFolderId;
    private long groupId;
    private boolean deletePermission;
    private boolean updatePermission;
    private String rowCheckerId = "";
    private String rowCheckerName = "";

    public WCFolder(JournalFolder folder) {
        this.folderId = folder.getFolderId();
        this.name = folder.getName();
        this.parentFolderId = folder.getParentFolderId();
        this.groupId = folder.getGroupId();
        this.deletePermission = false;
        this.updatePermission = false;
        this.rowCheckerId = String.valueOf(folder.getFolderId());
        this.rowCheckerName = JournalArticle.class.getSimpleName();
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

    public long getGroupId() {
        return groupId;
    }

    public void setGroupId(long groupId) {
        this.groupId = groupId;
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

    public String getRowCheckerId() {
        return rowCheckerId;
    }

    public void setRowCheckerId(String rowCheckerId) {
        this.rowCheckerId = rowCheckerId;
    }

    public String getRowCheckerName() {
        return rowCheckerName;
    }

    public void setRowCheckerName(String rowCheckerName) {
        this.rowCheckerName = rowCheckerName;
    }
}
