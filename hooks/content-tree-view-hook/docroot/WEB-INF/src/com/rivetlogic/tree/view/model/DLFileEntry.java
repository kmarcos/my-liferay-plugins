package com.rivetlogic.tree.view.model;

import com.liferay.portal.kernel.repository.model.FileEntry;

import java.io.Serializable;

public class DLFileEntry implements Serializable {

    private static final long serialVersionUID = 1L;
    private long fileEntryId;
    private String title = "";
    private String description = "";
    private String version = "";
    private long folderId;
    private long repositoryId;
    private boolean deletePermission;
    private boolean updatePermission;
    /* for preview */
    private boolean noPreviewGeneration;
    private boolean previewWillTakeTime;
    private boolean hasAudio;
    private boolean hasImages;
    private boolean hasVideo;
    private boolean hasPDFImages;
    private int previewFileCount;
    private String previewFileURL;

    public DLFileEntry(FileEntry fileEntry) {
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

    public boolean isNoPreviewGeneration() {
        return noPreviewGeneration;
    }

    public void setNoPreviewGeneration(boolean noPreviewGeneration) {
        this.noPreviewGeneration = noPreviewGeneration;
    }

    public boolean isPreviewWillTakeTime() {
        return previewWillTakeTime;
    }

    public void setPreviewWillTakeTime(boolean previewWillTakeTime) {
        this.previewWillTakeTime = previewWillTakeTime;
    }

    public boolean isHasAudio() {
        return hasAudio;
    }

    public void setHasAudio(boolean hasAudio) {
        this.hasAudio = hasAudio;
    }

    public boolean isHasImages() {
        return hasImages;
    }

    public void setHasImages(boolean hasImages) {
        this.hasImages = hasImages;
    }

    public boolean isHasVideo() {
        return hasVideo;
    }

    public void setHasVideo(boolean hasVideo) {
        this.hasVideo = hasVideo;
    }

    public boolean isHasPDFImages() {
        return hasPDFImages;
    }

    public void setHasPDFImages(boolean hasPDFImages) {
        this.hasPDFImages = hasPDFImages;
    }

    public int getPreviewFileCount() {
        return previewFileCount;
    }

    public void setPreviewFileCount(int previewFileCount) {
        this.previewFileCount = previewFileCount;
    }

    public String getPreviewFileURL() {
        return previewFileURL;
    }

    public void setPreviewFileURL(String previewFileURL) {
        this.previewFileURL = previewFileURL;
    }
}
