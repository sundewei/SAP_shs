package com.sap.ext.shield;

import com.sap.hadoop.conf.ConfigurationManager;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Created by IntelliJ IDEA.
 * User: I827779
 * Date: 11/22/12
 * Time: 1:48 PM
 * To change this template use File | Settings | File Templates.
 */
public class LogSender extends Thread {
    private final DefaultHttpClient client = new DefaultHttpClient();

    private final Random random = new Random();

    private String hdfsSourceFile;

    private String restUrl;

    private long lineCount = 0l;

    public LogSender(String hdfsSourceFile, String restUrl) {
        this.hdfsSourceFile = hdfsSourceFile;
        this.restUrl = restUrl;
    }

    private void sendLogs(List<String> lines, int retry) throws Exception {
        int failCount = 0;
        while (failCount < retry) {
            try {
                sendLogs(lines);
                return;
            } catch (Exception e) {
                e.printStackTrace();
                System.out.println("Retry: " + failCount + "/" + retry + ", line size: " + lines.size() + ",  because of this error: " + e.getMessage());
            }
            failCount++;
        }
        throw new IOException("Unable to finish sending log for " + hdfsSourceFile);
    }

    private void sendLogs(List<String> lines) throws Exception {
        HttpPost httpPost = new HttpPost(restUrl);
        httpPost.addHeader("Content-Type", "text/csv");
        StringEntity stringEntity = new StringEntity(getLine(lines));
        httpPost.setEntity(stringEntity);
        HttpResponse response = client.execute(httpPost);
        response.getEntity().getContent().close();
        if (response.getStatusLine().getStatusCode() != 200) {
            throw new IOException(response.getStatusLine().getReasonPhrase());
        }
    }

    private String getLine(List<String> lines) {
        StringBuilder stringBuilder = new StringBuilder();
        for (String line : lines) {
            stringBuilder.append(line).append("\n");
        }
        return stringBuilder.toString();
    }

    public void run() {
        try {
            ConfigurationManager cm = new ConfigurationManager("hadoop", "abcd1234");
            Path sourcePath = new Path(hdfsSourceFile);
            FileSystem fs = sourcePath.getFileSystem(cm.getConfiguration());
            BufferedReader reader = new BufferedReader(new InputStreamReader(fs.open(sourcePath)));
            String line = reader.readLine();
            List<String> lines = new ArrayList<String>();
            int lineLimit = random.nextInt(10000) + 1;
            while (line != null) {
                lines.add(line);
                if (lines.size() >= lineLimit) {
                    sendLogs(lines, 3);
                    lineCount += lines.size();
                    lines = new ArrayList<String>();
                    lineLimit = random.nextInt(5000) + 10000;
                    System.out.println("Sent " + lineCount + " lines from " + hdfsSourceFile);
                }
                line = reader.readLine();
            }
            if (lines.size() > 0) {
                sendLogs(lines, 3);
                System.out.println("Lats batch, sent " + lineCount + " lines from " + hdfsSourceFile);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public long getSentLineCount() {
        return lineCount;
    }

    public String getHdfsSourceFile() {
        return hdfsSourceFile;
    }

    public String getRestUrl() {
        return restUrl;
    }

    public static void main(String[] args) throws Exception {
        LogSender logSender = new LogSender(args[0], "http://llbpal36.pal.sap.corp:8080/shs/rest/table/22");
        //LogSender logSender = new LogSender("/data/shield/data/2012-01-01.log", "http://localhost:8182/table/22");
        logSender.run();
    }
}
