package com.sap.shs;

import com.sap.hadoop.conf.ConfigurationManager;
import org.apache.commons.io.IOUtils;
import org.apache.hadoop.fs.Path;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
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
 * Date: 11/20/12
 * Time: 3:14 PM
 * To change this template use File | Settings | File Templates.
 */
public class ShieldHttpSender extends BaseServlet {

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(true);
        ConfigurationManager cm = ((LoginPass) session.getAttribute(ShsContext.LOGIN_PASS)).getConfigurationManager();
        String targetUrl = request.getParameter("targetUrl");
        String xmlDataPath = request.getParameter("xmlDataPath");
        DefaultHttpClient client = new DefaultHttpClient();
        String method = request.getParameter("method") == null ? "post" : request.getParameter("method");
        HttpResponse res = null;
        if ("post".equalsIgnoreCase(method)) {
            Path file = new Path(xmlDataPath);
            String data = getData(file, cm.getConfiguration());
            HttpPost post = new HttpPost(targetUrl);
            post.addHeader("Content-Type", "application/xml");
            StringEntity stringEntity = new StringEntity(data);
            post.setEntity(stringEntity);
            res = client.execute(post);
        } else if ("put".equalsIgnoreCase(method)) {
            Path file = new Path(xmlDataPath);
            String data = getData(file, cm.getConfiguration());
            HttpPut put = new HttpPut(targetUrl);
            put.addHeader("Content-Type", "application/xml");
            StringEntity stringEntity = new StringEntity(data);
            put.setEntity(stringEntity);
            res = client.execute(put);
        } else if ("delete".equalsIgnoreCase(method)) {
            HttpDelete delete = new HttpDelete(targetUrl);
            res = client.execute(delete);
        }
        HttpEntity entity = res.getEntity();
        StringWriter writer = new StringWriter();
        IOUtils.copy(entity.getContent(), writer);
        PrintWriter out = response.getWriter();
        out.write(writer.toString());
        out.close();
    }
}
