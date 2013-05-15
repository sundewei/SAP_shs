package com.sap.shs;

import com.sap.hadoop.conf.ConfigurationManager;
import com.sap.hadoop.conf.IFileSystem;
import org.apache.commons.lang3.StringUtils;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: I827779
 * Date: 12/29/11
 * Time: 1:26 PM
 * To change this template use File | Settings | File Templates.
 */
public class SubmitMovieRecommenderJob extends BaseServlet {

    private String scriptName;

    private String movieRecommenderWorkingFolder;

    private String movieRecommenderProcessingFolder;

    public void init() {
        scriptName = getInitParameter("scriptFilename");

        System.out.println("\n\n\nSubmitMovieRecommenderJob scriptName===" + scriptName + "\n\n\n\n");

        if (StringUtils.isEmpty(scriptName)) {
            throw new RuntimeException("'scriptFilename' was not defined in the web.xml for SubmitMovieRecommenderJob servlet");
        }

        movieRecommenderWorkingFolder = getInitParameter("workingFolder");
        if (StringUtils.isEmpty(movieRecommenderWorkingFolder)) {
            throw new RuntimeException("'workingFolder' was not defined in the web.xml for SubmitMovieRecommenderJob servlet");
        }
        movieRecommenderProcessingFolder = movieRecommenderWorkingFolder + "processing/";
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            long startTime = System.currentTimeMillis();

            HttpSession session = request.getSession(true);
            ConfigurationManager configurationManager =
                    ((LoginPass) session.getAttribute(ShsContext.LOGIN_PASS)).getConfigurationManager();

            IFileSystem fileSystem = configurationManager.getFileSystem();
            // Just in cast when the processing folder does not exist
            createIfNotExist(fileSystem, movieRecommenderProcessingFolder);

            // The timestamp user id with some randomness
            long userId = System.currentTimeMillis() + Math.abs(session.hashCode());

            String threadLocalMovieRecommenderTempFolder = movieRecommenderProcessingFolder + userId + "/";
            createIfNotExist(fileSystem, threadLocalMovieRecommenderTempFolder);

            String mergedUserRatingFile = threadLocalMovieRecommenderTempFolder + userId + ".csv";
            String userRatingFile = movieRecommenderWorkingFolder + "ratings.csv";
            String usersFile = threadLocalMovieRecommenderTempFolder + "users.txt";
            String outputFolder = threadLocalMovieRecommenderTempFolder + "output";
            String tempFolder = threadLocalMovieRecommenderTempFolder + "temp";
            String resultFile = outputFolder + "/part-r-00000";

            StringBuilder nowUserRating = new StringBuilder();
            // Getting the movie ratings from the query string
            for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
                String key = entry.getKey();
                if (key.startsWith("m")) {
                    nowUserRating.append(userId).append(",").append(entry.getKey().replace("m", "")).append(",")
                            .append(entry.getValue()[0]).append("\n");
                }
            }


            System.out.println("Deleting " + outputFolder);
            System.out.println("Deleting " + tempFolder);
            // Delete the output and temp folders
            fileSystem.deleteDirectory(outputFolder);
            fileSystem.deleteDirectory(tempFolder);

            // Now read the existing preference data append to the current rating string
            nowUserRating.append(ShsContext.readHdfsFile(configurationManager, userRatingFile));

            // Write the merged rating so it can be passed as a parameter
            ShsContext.writeToHdfsFile(configurationManager, mergedUserRatingFile, nowUserRating.toString());

            // Write the user id file so we only do one user
            ShsContext.writeToHdfsFile(configurationManager, usersFile, String.valueOf(userId));

            List<String> parameterList = new ArrayList<String>();
            parameterList.add("org.apache.mahout.cf.taste.hadoop.item.RecommenderJob");
            parameterList.add("-Dmapred.input.dir=" + mergedUserRatingFile);
            parameterList.add("-Dmapred.output.dir=" + outputFolder);
            parameterList.add("--tempDir " + tempFolder);
            parameterList.add("--numRecommendations 5");
            if (!StringUtils.isEmpty(usersFile)) {
                parameterList.add("--usersFile " + usersFile);
            }

            String command = ShsContext.getCommand(scriptName, parameterList.toArray(new String[parameterList.size()]));
            System.out.println("In SubmitMovieRecommenderJob, scriptName = " + scriptName);
            System.out.println("In SubmitMovieRecommenderJob, command=\n" + command);
            Process process = ShsContext.execute(command);
            InputStream error = process.getErrorStream();

            BufferedReader reader = new BufferedReader(new InputStreamReader(error));
            String line = reader.readLine();
            while (line != null) {
                line = reader.readLine();
            }
            error.close();
            PrintWriter out = response.getWriter();
            response.setContentType("application/json");
            Map<String, String> jsonKeyValMap = null;
            try {
                jsonKeyValMap = getRecommendedMovieJsonMap(configurationManager, resultFile);
            } catch (Exception e) {
                IOException ioe = new IOException();
                ioe.setStackTrace(e.getStackTrace());
                throw ioe;
            }
            long endTime = System.currentTimeMillis();
            jsonKeyValMap.put("duration", String.valueOf(endTime - startTime));
            out.write(ShsContext.getJsonString(jsonKeyValMap));
            out.close();
        } catch (Exception e) {
            IOException ioe = new IOException(e.getMessage());
            ioe.setStackTrace(e.getStackTrace());
            throw ioe;
        }
    }

    private static void createIfNotExist(IFileSystem fs, String folder) throws Exception {
        if (!fs.exists(folder)) {
            fs.mkdirs(folder);
        }
    }

    private static Map<String, String> getRecommendedMovieJsonMap(ConfigurationManager cm, String resultFile) throws Exception {
        Map<String, String> jsonKeyValMap = new LinkedHashMap<String, String>();
        // 2101535436	[27:4.7,18:4.647059,19:4.625,32:4.590909,6:4.5]
        String line = ShsContext.readHdfsFile(cm, resultFile).trim();
        int start = line.indexOf("[");
        int end = line.indexOf("]");
        line = line.substring(start + 1, end);
        String[] values = line.split(",");
        int index = 0;
        for (String value : values) {
            String[] keyValue = value.split(":");
            jsonKeyValMap.put("movie_" + index, keyValue[0]);
            index++;
        }
        return jsonKeyValMap;
    }

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

    public static void main(String[] arg) throws Exception {
    }
}
