package com.sap.shs.demo;

import com.sap.hadoop.conf.ConfigurationManager;
import com.sap.hadoop.conf.IFile;
import com.sap.shs.ShsContext;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringEscapeUtils;

import java.io.BufferedOutputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.*;

/**
 * Created by IntelliJ IDEA.
 * User: I827779
 * Date: 12/28/11
 * Time: 9:41 PM
 * To change this template use File | Settings | File Templates.
 */
public class AmazonMovie implements Comparable<AmazonMovie> {
    private static Collection<AmazonMovie> AMAZON_MOVIES;
    private static Map<Integer, AmazonMovie> AMAZON_MOVIE_MAP = new HashMap<Integer, AmazonMovie>();
    private int id;
    private String asin;
    private String name;
    private String htmlContent;

    public static AmazonMovie getAmazonMovie(Integer id) {
        return AMAZON_MOVIE_MAP.get(id);
    }

    public static Collection<AmazonMovie> movies() {
        return AMAZON_MOVIES;
    }

    public static void setAmazonMovies(Collection<AmazonMovie> movies) {
        AMAZON_MOVIES = movies;
        AMAZON_MOVIE_MAP = new HashMap<Integer, AmazonMovie>();
        for (AmazonMovie movie : AMAZON_MOVIES) {
            AMAZON_MOVIE_MAP.put(movie.getId(), movie);
        }
    }

    public static boolean isMovieReady() {
        return AMAZON_MOVIES != null && AMAZON_MOVIES.size() > 0;
    }

    public String getAmazonMovieUrl() {
        return "http://www.amazon.com/dp/" + asin;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getAsin() {
        return asin;
    }

    public void setAsin(String asin) {
        this.asin = asin;
    }

    public String getName() {
        return name;
    }

    public String getShortName(int length, boolean escapeJavascript) {
        String displayName = name;
        if (name.length() > length) {
            displayName = name.substring(0, length);
        }

        if (escapeJavascript) {
            return StringEscapeUtils.escapeHtml4(displayName);
        } else {
            return displayName;
        }
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHtmlContent() {
        return htmlContent;
    }

    public void setHtmlContent(String htmlContent) {
        this.htmlContent = htmlContent;
    }

    @Override
    public String toString() {
        return "AmazonMovie{" +
                "id=" + id +
                ", asin='" + asin + '\'' +
                ", name='" + name + '\'' +
                ", url='" + getAmazonMovieUrl() + '\'' +
                '}';
    }

    public int compareTo(AmazonMovie o) {
        return name.compareTo(o.getName());
    }

    public static void refreshAmazonMovies(Connection conn, ConfigurationManager cm, String hdfsFolder) throws Exception {
        String query = " SELECT ID, NAME, ASIN " +
                " FROM AMAZON_MOVIES ";
        PreparedStatement pstmt = conn.prepareStatement(query);
        ResultSet rs = pstmt.executeQuery();
        while (rs.next()) {
            int id = rs.getInt(1);
            String name = rs.getString(2);
            String asin = rs.getString(3);

            String propertyFilename = hdfsFolder + id + ".properties";
            String amazonUrl = "http://www.amazon.com/dp/" + asin;
            String movieHtmFile = hdfsFolder + id + ".htm";
            if (!cm.getFileSystem().exists(movieHtmFile) || cm.getFileSystem().getSize(movieHtmFile) == 0) {
                String content = ShsContext.getUrlContent(amazonUrl);
                ShsContext.writeToHdfsFile(cm, movieHtmFile, content);
            }
            StringBuilder sb = new StringBuilder();
            sb.append("ID=").append(id).append("\n");
            sb.append("NAME=").append(name).append("\n");
            sb.append("ASIN=").append(asin).append("\n");
            sb.append("HDFS_HTML=").append(movieHtmFile);
            BufferedOutputStream out = new BufferedOutputStream(cm.getFileSystem().getOutputStream(propertyFilename));
            out.write(sb.toString().getBytes());
            out.close();
        }
        rs.close();
        pstmt.close();


    }

    public static void refreshFreqMovieList(Connection conn, ConfigurationManager cm, String freqMoviePath) throws Exception {
        String query = " SELECT MOVIE_ID, M.ASIN, COUNT(0)\n" +
                " FROM AMAZON_MOVIE_REVIEWS R, AMAZON_MOVIES M\n" +
                " WHERE R.MOVIE_ID = M.ID\n" +
                " GROUP BY MOVIE_ID, ASIN\n" +
                " ORDER BY 2 DESC ";
        PreparedStatement pstmt = conn.prepareStatement(query);
        ResultSet rs = pstmt.executeQuery();
        StringBuilder sb = new StringBuilder();
        while (rs.next()) {
            sb.append(rs.getString(1)).append(",").append(rs.getString(2)).append("\n");
        }
        rs.close();
        pstmt.close();
        BufferedOutputStream out = new BufferedOutputStream(cm.getFileSystem().getOutputStream(freqMoviePath));
        out.write(sb.toString().getBytes());
        out.close();
    }

    public static void refreshMovieRatings(Connection conn, ConfigurationManager cm, String hdfsFilename) throws Exception {
        String query = " SELECT USER_ID, MOVIE_ID, RATING\n" +
                " FROM AMAZON_MOVIE_REVIEWS R ";
        PreparedStatement pstmt = conn.prepareStatement(query);
        ResultSet rs = pstmt.executeQuery();
        StringBuilder sb = new StringBuilder();
        while (rs.next()) {
            sb.append(rs.getString(1)).append(",").append(rs.getString(2)).append(",").append(rs.getString(3)).append("\n");
        }
        rs.close();
        pstmt.close();
        BufferedOutputStream out = new BufferedOutputStream(cm.getFileSystem().getOutputStream(hdfsFilename));
        out.write(sb.toString().getBytes());
        out.close();
    }

    public static Collection<AmazonMovie> getAmazonMovies(ConfigurationManager cm, String hdfsFolder) throws Exception {
        // 1.properties
        Collection<AmazonMovie> amazonMovies = new TreeSet<AmazonMovie>();
        IFile[] files = cm.getFileSystem().listFiles(hdfsFolder);
        System.out.println("files.length=" + files.length);
        for (IFile file : files) {
            if (file.getName().endsWith(".properties")) {
                Properties properties = new Properties();
                properties.load(cm.getFileSystem().getInputStream(file.getFilename()));
                AmazonMovie amazonMovie = null;
                if (properties.getProperty("NAME") != null) {
                    if (amazonMovie == null) {
                        amazonMovie = new AmazonMovie();
                        amazonMovie.setName(properties.getProperty("NAME"));
                    }
                }

                if (properties.getProperty("ID") != null) {
                    amazonMovie.setId(Integer.parseInt(properties.getProperty("ID")));
                }

                if (properties.getProperty("ASIN") != null) {
                    amazonMovie.setAsin(properties.getProperty("ASIN"));
                }
                amazonMovie.setHtmlContent(ShsContext.readHdfsFile(cm, properties.getProperty("HDFS_HTML")));
                amazonMovies.add(amazonMovie);
            }
        }
        return amazonMovies;
    }

    public static void main(String[] arg) throws Exception {

        /*String query =  " select id, 'http://www.amazon.com/dp/' || asin\n" +
                        " from amazon_movies ";

        Connection conn = Utilities.getConnection();
        PreparedStatement stmt = conn.prepareStatement(query);
        ResultSet rs = stmt.executeQuery();
        StringBuilder sb = new StringBuilder();
        while (rs.next()) {
            sb.append(rs.getInt(1)).append(",").append(rs.getString(2)).append("\n");
        }
        rs.close();
        stmt.close();
        conn.close();
        FileUtils.write(new File("c:\\temp\\movie.csv"), sb.toString());
        */
        List<String> lines = IOUtils.readLines(new FileInputStream("c:\\temp\\movie.csv"));
        for (String line : lines) {
            String[] values = line.split(",");
            String filename = "c:\\temp\\movies\\" + values[0] + ".htm";
            IOUtils.write(ShsContext.getUrlContent(values[1]), new FileOutputStream(filename));
        }
    }
}
