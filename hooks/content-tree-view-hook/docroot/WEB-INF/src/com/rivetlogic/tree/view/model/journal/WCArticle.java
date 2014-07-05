package com.rivetlogic.tree.view.model.journal;

import com.liferay.portal.kernel.repository.model.Folder;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portlet.journal.model.JournalArticle;

import java.io.Serializable;

public class WCArticle implements Serializable {

    private static final long serialVersionUID = 1L;
    private String articleId = "";
    private String title = "";
    private double version;
    private long folderId;
    private long groupId;
    private boolean deletePermission;
    private boolean updatePermission;
    private String articleImageURL = "";
    private String rowCheckerId = "";
    private String rowCheckerName = "";

    public WCArticle(JournalArticle article) {
        this.articleId = article.getArticleId();
        this.version = article.getVersion();
        this.title = article.getTitle(LocaleUtil.getSiteDefault());
        this.folderId = article.getFolderId();
        this.groupId = article.getGroupId();
        this.deletePermission = false;
        this.updatePermission = false;
        this.rowCheckerId = article.getArticleId();
        this.rowCheckerName = Folder.class.getSimpleName();
    }

    public String getArticleId() {
        return articleId;
    }

    public void setArticleId(String articleId) {
        this.articleId = articleId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public double getVersion() {
        return version;
    }

    public void setVersion(double version) {
        this.version = version;
    }

    public long getFolderId() {
        return folderId;
    }

    public void setFolderId(long folderId) {
        this.folderId = folderId;
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

    public String getArticleImageURL() {
        return articleImageURL;
    }

    public void setArticleImageURL(String articleImageURL) {
        this.articleImageURL = articleImageURL;
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
