/**
 * Copyright (c) 2000-2013 Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.rivetlogic.tree.view.service.impl;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.exception.SystemException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.repository.model.FileEntry;
import com.liferay.portal.kernel.repository.model.FileVersion;
import com.liferay.portal.kernel.repository.model.Folder;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.security.permission.ActionKeys;
import com.liferay.portal.theme.ThemeDisplay;
import com.liferay.portlet.documentlibrary.service.DLAppServiceUtil;
import com.liferay.portlet.documentlibrary.util.AudioProcessorUtil;
import com.liferay.portlet.documentlibrary.util.DLProcessorRegistryUtil;
import com.liferay.portlet.documentlibrary.util.DLUtil;
import com.liferay.portlet.documentlibrary.util.ImageProcessorUtil;
import com.liferay.portlet.documentlibrary.util.PDFProcessorUtil;
import com.liferay.portlet.documentlibrary.util.VideoProcessorUtil;
import com.rivetlogic.tree.view.model.DLFileEntry;
import com.rivetlogic.tree.view.model.DLFolder;
import com.rivetlogic.tree.view.service.base.EnhancedDLAppServiceBaseImpl;

import java.util.ArrayList;
import java.util.List;

/**
 * The implementation of the enhanced d l app remote service.
 * 
 * <p>
 * All custom service methods should be put in this class. Whenever methods are
 * added, rerun ServiceBuilder to copy their definitions into the
 * {@link com.rivetlogic.tree.view.service.EnhancedDLAppService} interface.
 * 
 * <p>
 * This is a remote service. Methods of this service are expected to have
 * security checks based on the propagated JAAS credentials because this service
 * can be accessed remotely.
 * </p>
 * 
 * @author rivetlogic
 * @see com.rivetlogic.tree.view.service.base.EnhancedDLAppServiceBaseImpl
 * @see com.rivetlogic.tree.view.service.EnhancedDLAppServiceUtil
 */
public class EnhancedDLAppServiceImpl extends EnhancedDLAppServiceBaseImpl {
    /*
     * NOTE FOR DEVELOPERS:
     * 
     * Never reference this interface directly. Always use {@link
     * com.rivetlogic.tree.view.service.EnhancedDLAppServiceUtil} to access the
     * enhanced d l app remote service.
     */
    
    private static final Log log = LogFactoryUtil.getLog(EnhancedDLAppServiceImpl.class);

    public List<Object> getFoldersAndFileEntriesAndFileShortcuts(long repositoryId, long folderId, int status,
            boolean includeMountFolders, int start, int end) throws PortalException, SystemException {

        List<Object> items = DLAppServiceUtil.getFoldersAndFileEntriesAndFileShortcuts(repositoryId, folderId, status,
                includeMountFolders, start, end);

        List<Object> results = new ArrayList<Object>();

        for (Object o : items) {

            if (o instanceof Folder) {
                Folder folder = (Folder) o;
                DLFolder dlFolder = new DLFolder(folder);
                dlFolder.setDeletePermission(folder.containsPermission(getPermissionChecker(), ActionKeys.DELETE));
                dlFolder.setUpdatePermission(folder.containsPermission(getPermissionChecker(), ActionKeys.UPDATE));
                results.add(dlFolder);
            }
            if (o instanceof FileEntry) {
                FileEntry fileEntry = (FileEntry) o;
                DLFileEntry dlFileEntry = new DLFileEntry(fileEntry);
                dlFileEntry
                        .setDeletePermission(fileEntry.containsPermission(getPermissionChecker(), ActionKeys.DELETE));
                dlFileEntry
                        .setUpdatePermission(fileEntry.containsPermission(getPermissionChecker(), ActionKeys.UPDATE));
                results.add(dlFileEntry);
                
                setPreviewDataForEntry( fileEntry, dlFileEntry);
            }
        }

        return results;
    }
    
    /**
     * This logic was taken from html/portlet/document_library/view_file_entry.jsp
     * under <c:if test="<%= PropsValues.DL_FILE_ENTRY_PREVIEW_ENABLED %>">
     * It is also replicated in hook file preview_query.jspf
     * @param fileEntry
     * @param dlFileEntry
     */
    private void setPreviewDataForEntry( FileEntry fileEntry, DLFileEntry dlFileEntry){
        
        ThemeDisplay themeDisplay  = null;
        FileVersion latestFileVersion;
        
        try {
            latestFileVersion = fileEntry.getLatestFileVersion();
        } catch (Exception e) {
            log.error(e);
            return;
        } 
        
        dlFileEntry.setHasAudio(AudioProcessorUtil.hasAudio(latestFileVersion));
        dlFileEntry.setHasImages(ImageProcessorUtil.hasImages(latestFileVersion));
        dlFileEntry.setHasPDFImages(PDFProcessorUtil.hasImages(latestFileVersion));
        dlFileEntry.setHasVideo(VideoProcessorUtil.hasVideo(latestFileVersion));

        int previewFileCount = 0;
        String previewFileURL = null;
        String[] previewFileURLs = null;
        String videoThumbnailURL = null;
        
        String previewQueryString = null;
        
        if (dlFileEntry.isHasAudio()) {
            previewQueryString = "&audioPreview=1";
        }
        else if (dlFileEntry.isHasImages()) {
            previewQueryString = "&imagePreview=1";
        }
        else if (dlFileEntry.isHasPDFImages()) {
            previewFileCount = PDFProcessorUtil.getPreviewFileCount(latestFileVersion);
        
            previewQueryString = "&previewFileIndex=";
        
            previewFileURL = DLUtil.getPreviewURL(fileEntry, latestFileVersion, themeDisplay, previewQueryString);
        }
        else if (dlFileEntry.isHasVideo()) {
            previewQueryString = "&videoPreview=1";
        
            videoThumbnailURL = DLUtil.getPreviewURL(fileEntry, latestFileVersion, themeDisplay, "&videoThumbnail=1");
        }
        
        if (Validator.isNotNull(previewQueryString)) {
            if (dlFileEntry.isHasAudio()) {
                previewFileURLs = new String[PropsValues.DL_FILE_ENTRY_PREVIEW_AUDIO_CONTAINERS.length];
        
                for (int i = 0; i < PropsValues.DL_FILE_ENTRY_PREVIEW_AUDIO_CONTAINERS.length; i++) {
                    previewFileURLs[i] = DLUtil.getPreviewURL(fileEntry, latestFileVersion, themeDisplay, previewQueryString + "&type=" + PropsValues.DL_FILE_ENTRY_PREVIEW_AUDIO_CONTAINERS[i]);
                }
            }
            else if (dlFileEntry.isHasVideo()) {
                if (PropsValues.DL_FILE_ENTRY_PREVIEW_VIDEO_CONTAINERS.length > 0) {
                    previewFileURLs = new String[PropsValues.DL_FILE_ENTRY_PREVIEW_VIDEO_CONTAINERS.length];
        
                    for (int i = 0; i < PropsValues.DL_FILE_ENTRY_PREVIEW_VIDEO_CONTAINERS.length; i++) {
                        previewFileURLs[i] = DLUtil.getPreviewURL(fileEntry, latestFileVersion, themeDisplay, previewQueryString + "&type=" + PropsValues.DL_FILE_ENTRY_PREVIEW_VIDEO_CONTAINERS[i]);
                    }
                }
                else {
                    previewFileURLs = new String[1];
        
                    previewFileURLs[0] = videoThumbnailURL;
                }
            }
            else {
                previewFileURLs = new String[1];
        
                previewFileURLs[0] = DLUtil.getPreviewURL(fileEntry, latestFileVersion, themeDisplay, previewQueryString);
            }
        
            previewFileURL = previewFileURLs[0];
        
            if (!dlFileEntry.isHasPDFImages()) {
                previewFileCount = 1;
            }
            
            dlFileEntry.setPreviewFileCount(previewFileCount);
            dlFileEntry.setPreviewFileURL(previewFileURL);
            dlFileEntry.setNoPreviewGeneration(noPreviewGeneration(latestFileVersion));
            dlFileEntry.setPreviewWillTakeTime(previewWillTakeTime(latestFileVersion));
        }
   
    }
    
    /**
     * This logic was taken from html/portlet/document_library/view_file_entry.jsp
     * is the condition tested for print <liferay-ui:message key="file-is-too-large-for-preview-or-thumbnail-generation" />
     * It is also replicated in hook file preview_query.jspf
     * @param fileVersion
     * @return true if is no Preview Generation for this file version. otherwise false.
     */
    private boolean noPreviewGeneration(FileVersion fileVersion){
        return !DLProcessorRegistryUtil.isPreviewableSize(fileVersion) && (AudioProcessorUtil.isAudioSupported(fileVersion.getMimeType()) || ImageProcessorUtil.isImageSupported(fileVersion.getMimeType()) || PDFProcessorUtil.isDocumentSupported(fileVersion.getMimeType()) || VideoProcessorUtil.isVideoSupported(fileVersion.getMimeType()));
    }
    
    /**
     * This logic was taken from html/portlet/document_library/view_file_entry.jsp
     * is the condition tested for print <liferay-ui:message key="generating-preview-will-take-a-few-minutes" />
     * It is also replicated in hook file preview_query.jspf
     * @param fileVersion
     * @return true if Preview is not ready yet for this file version. otherwise false.
     */
    private boolean previewWillTakeTime(FileVersion fileVersion){
        return AudioProcessorUtil.isAudioSupported(fileVersion) || ImageProcessorUtil.isImageSupported(fileVersion) || PDFProcessorUtil.isDocumentSupported(fileVersion) || VideoProcessorUtil.isVideoSupported(fileVersion);
    }
}