package com.sap.shs;

import com.sap.hadoop.conf.ConfigurationManager;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.hadoop.fs.Path;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

/**
 * Created by IntelliJ IDEA.
 * User: I827779
 * Date: 11/27/12
 * Time: 8:27 PM
 * To change this template use File | Settings | File Templates.
 */
public class ShieldQuery extends BaseServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String queryRestUrl = request.getParameter("queryRestUrl");
        String loopRestUrl = request.getParameter("loopRestUrl");
        String xmlDataPath = request.getParameter("xmlDataPath");
        HttpSession session = request.getSession(true);
        ConfigurationManager cm = ((LoginPass) session.getAttribute(ShsContext.LOGIN_PASS)).getConfigurationManager();
        Path file = new Path(xmlDataPath);
        String data = getData(file, cm.getConfiguration());
        String resultKey = getResultKey(queryRestUrl, data);
        if (!loopRestUrl.endsWith("/")) {
            loopRestUrl = loopRestUrl + "/";
        }
        loopRestUrl = loopRestUrl + resultKey + "/2000";
        PrintWriter out = response.getWriter();
        DefaultHttpClient client = new DefaultHttpClient();
        HttpGet get = new HttpGet(loopRestUrl);
        boolean wroteFirstLines = false;
        while (true) {
            HttpResponse res = client.execute(get);
            String errorReason = null;
            if (res.getStatusLine().getStatusCode() != 200) {
                errorReason = res.getStatusLine().getReasonPhrase();
            }
//System.out.println("Before getting res.getEntity()");
            HttpEntity entity = res.getEntity();
//System.out.println("After getting res.getEntity()");
            StringWriter writer = new StringWriter();
//System.out.println("Before copying the entity.getContent()");
            if (entity != null) {
                IOUtils.copy(entity.getContent(), writer);
            }
//System.out.println("After copying the entity.getContent()");
            String lines = writer.toString();
//System.out.println("lines="+lines);
            if (!wroteFirstLines && !StringUtils.isEmpty(errorReason)) {
                out.write("<b><font color='red'>Error occurred: " + errorReason + " </font></b>");
                out.flush();
                break;
            }

            if (wroteFirstLines && !StringUtils.isEmpty(errorReason)) {
                break;
            }

            if (!StringUtils.isEmpty(lines) && !lines.contains("Bad Request")) {
                out.write(lines);
                out.flush();
                wroteFirstLines = true;
            }

            if (StringUtils.isEmpty(lines) && !wroteFirstLines) {
                out.write("<b><font color='red'>No matching result!</font></b>");
                out.flush();
                break;
            }

            if (StringUtils.isEmpty(lines) && wroteFirstLines) {
                break;
            }
        }
        out.close();
    }

    public String getResultKey(String restUrl, String requestXmlData) throws IOException {
        DefaultHttpClient client = new DefaultHttpClient();
        HttpPost httpPost = new HttpPost(restUrl);
        httpPost.addHeader("Content-Type", "application/xml");
        StringEntity stringEntity = new StringEntity(requestXmlData);
        httpPost.setEntity(stringEntity);
        HttpResponse response = client.execute(httpPost);
        if (response.getStatusLine().getStatusCode() != 200) {
            throw new IOException("Unable to query the rest server to get a result key: " + response.getStatusLine().getReasonPhrase());
        }
        HttpEntity entity = response.getEntity();
        StringWriter writer = new StringWriter();
        IOUtils.copy(entity.getContent(), writer);
        return writer.toString();
    }
}
