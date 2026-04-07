package com.streetbite.dto.file;

public class FileUploadResponse {
    private String url;

    public FileUploadResponse() {
    }

    public FileUploadResponse(String url) {
        this.url = url;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
