---
name: "Professor Demographics in Film"
tags: [web scraping, python]
featuredImage: professors.jpg
description: "Diversity in professorships has long been a problem pervasive throughout academia. In this web scrapping project, I analyzed the casts of over 1000 movies on IMBD to find the gender of characters who were professors. Unfortunately, the results were not surprising."
path: /professor_project
---

Inspired by [this Washington Post article](https://www.washingtonpost.com/graphics/2020/entertainment/fictional-presidents-in-movies/) analyzing the demographics of actors who portrayed presidents in mopvies (they found that they were mostly portrayed by white males), I wanted to try a similar experiment with a portrayl of positions of power, relevant to my life: university professors.

## Obtaining Data
First, I need to find a list of movies that portray professors in some capacity. Fortunately, IMBD has tags for all of their movies, one of them being a "professor" tab. Each IMBD movie has a unique code which I need to obtain to iterate through the casts of these movies. `find_profmovies` will iterate through a list of all the movies on IMBD with the "professor" tag, obtain the IMBD codes, and store them in a list.


```python
import urllib
import re
from collections import OrderedDict

def find_profmovies(n, o):
    """
    iterates through a given list
    """
    totallist = []
    codes = []
    for i in range(n,o):
        url = "https://www.imdb.com/search/keyword/?keywords=professor&mode=detail&page="+ str(i)+"&ref_=kw_nxt&sort=moviemeter,asc&title_type=movie"
        # retrieve the data
        filedata = urllib.request.urlopen(url)
        # read as bytes
        bytes_text = filedata.read()
        # decode bytes to string
        html = bytes_text.decode("utf-8")
        
        pattern = r'alt="(.*)"'
        totallist += re.findall(pattern, html)
        
        pattern2 = r'<a href="/title/([\w]+)/'
        codes += re.findall(pattern2, html)
        
    codes = list(OrderedDict.fromkeys(codes))
    
    if len(totallist) == len(codes):
        D = {}
        for j in range(len(totallist)):
            D[totallist[j]] = codes[j]
    else:
        print("Lengths aren't equal")
            
        
    return totallist, codes, D


        
        
```


```python
movies, codes, Dcodes = find_profmovies(1, 28)
```

The template for accessing each individual movie's IMBD page is relatively simple: `https://www.imdb.com/title/` followed by the movie code. `gen_urls` will simply combine the base url and the movie code to generate a list of all the url's we eventually will need to scrape and store it in the list `urls`. It will also follow a similar template and store the urls of the full cast pages in the list `cast`.


```python
def gen_urls(movies, L):
    urls = []
    cast = []
    Dcast = {}
    for i in range(len(L)):
        urls.append("https://www.imdb.com/title/" + str(L[i]))
        cast.append("https://www.imdb.com/title/" + str(L[i]) + "/fullcredits?ref_=tt_cl_sm#cast")
        Dcast[movies[i]] = cast[i]
    return urls, cast, Dcast
    
urls, cast, Dcast = gen_urls(movies, codes)
```


```python
urls[312]
```




    'https://www.imdb.com/title/tt0269743'



### Scraping Movie Data
Now comes a bit more tedious of a task: taking the data from each movie's IMBD page and converting it into a form that we can perform data analysis on. Now, there are several IMBD API's, but they are either very poorly documented or have a limit of 100 requests per day. The issue is I have 1000 movies, so web scrapping was the most viable path for me to get the data I needed efficently. I will be using the `requests` library to obtain the `html` markdown and the `BeautifulSoup` library to parse through the markdown to get the data I need. 


```python
import requests
from bs4 import BeautifulSoup
```

In an effort to make my code more robust, I functionalized this process, creating a function for each task I wanted (getting the movie title, year, etc.) and combined those functions into a larger function. Each of these functions will take in a `soup` object to parse.


```python
import time

def gen_roles(soup):
    """
    takes in a soup object of the full cast page and returns a dictionary of the character name and the actor name
    """
    stop, count = 0,0
    character = []
    actor = []
    
    #find the breaking point of the main cast list
    for i in soup.select('.cast_list tr'):
        if i.get_text() == "Rest of cast listed alphabetically:":
            break
        stop +=1
    #find the character names
    for i in soup.find_all('td', class_ = "character"):
        try:
            character.append(i.find('a').get_text())
        except AttributeError:
            trial = i.get_text().split("\n")
            trial = [j for j in trial if j != ""]
            trial = [x.strip(' ') for x in trial]
            if len(trial) == 0:
                character.append("SKIPPED")
                continue
            character.append(str(trial[0]))
        count += 1
        if count == stop:
            count = 0
            break
            
    #find the actor names
    for i in soup.select("tr td img"):
        actor.append(i['alt'])
        count += 1
        if count == stop:
            count = 0
            break
            
    #put the actors and characters in a dict
    actor_dict = {}
    for i in range(len(actor)):
        actor_dict[character[i]] = actor[i]
    
    #make a dict of only the actors and characters who are professors
    prof_dict = {}
    prof_list = [i for i in list(actor_dict.keys()) if i[:4] == "Prof"]
    for i in prof_list:
        prof_dict[actor_dict[i]] = i
        
    return prof_dict
```


```python
def gen_genre(soup):
    """
    takes in a soup object of the movie page and extracts a list of the movie's genres as determined by IMBD
    """
    genrelist = []
    genres = soup.find_all(class_='see-more inline canwrap')[1]
    for i in genres.find_all('a'):
        genrelist.append(i.get_text().split()[0])
    return genrelist
```


```python
def gen_rating(soup):
    """
    takes in a soup object of the main movie page and returns the metacritic rating as a string
    """
    try: 
        rating = int(soup.select('div .titleReviewBarItem span')[0].get_text())
    except ValueError:
        try:
            rating = soup.select('div .titleReviewBarItem span a')[1].get_text().split()[0]
        except IndexError:
            rating = "NONE"
    except IndexError: 
        rating = "NONE"
    return rating
```


```python
def gen_year(soup):
    """
    takes in a soup object of the main movie page and returns the year the movie was released as a string
    """
    return soup.find(id="titleYear").get_text().split("(")[1].split(")")[0]
```

Finally, we will combine all of these functions into one giant `create_data` function, which will take in a range of movies and return a dictionary of relevant info for each professor character. Each index of the dictionary represents one character, and contains info about the movie the character is protrayed in as well as the actr. For example, the Harry Potter movies will take up several different indexes because there are multiple professors portrayed in each one.

The function determines whether or not a character is a professor by analyzing if their listed role contained the string "prof" in the `gen_roles` function. If none of the characters in the cast list meet this requirement, the function will skip over that movie and place the title in the list `no_profs`.

The parameter `skip` will add the movie information to the main dictionary if set to false. If set to true, it will not add movies without explicitly titled professors to the main dictionary.


```python
def create_data(x, skip = False, addnone = False):
    """
    takes in a range of movies and returns a JSON formated dictionary of info about each professor character
    """
    data = {}
    no_profs_data = {}
    no_profs = []
    count = 0
    starttt = time.time()
    # iterate through the inputed range
    for i in range(x):
        start_time = time.time()
        
        # get soup objects for the cast page
        castpage = requests.get(cast[i])
        cast_soup = BeautifulSoup(castpage.content, 'html.parser')
        role_list = gen_roles(cast_soup)
        
        #skip if there are no professors generated from the gen roles function and skip parameter is True
        if (len(role_list) == 0) and (skip == True):
            print("skipping")
            no_profs.append(movies[i])
            continue
            
        # get soup objects for main page
        summarypage = requests.get(urls[i])
        summary_soup = BeautifulSoup(summarypage.content, 'html.parser')
        
        year = gen_year(summary_soup)
        rating = gen_rating(summary_soup)
        genre_list = gen_genre(summary_soup)
            
        
        if len(role_list) != 0:
            for j in list(role_list.keys()): 
                movie_info = {}
                movie_info["Name"] = movies[i]
                movie_info["Number"] = i #number of movie
                movie_info["Year"] = year #set year to year of movie
                movie_info["Actor"] = j  #set actors to a dict of actors and their charachters
                movie_info["Role"] = role_list[j]
                movie_info["Rating"] = rating
                for k in range(len(genre_list)):
                    movie_info["Genre " + str(k+1)] = genre_list[k]
                    if k == 3:
                        break;
                data[count] = movie_info #set key in data equal to movie name and value equal to the dictionary of movie info
                count += 1
            print("--- %s seconds ---" % round((time.time() - start_time), 2))
        # if skip parameter is false, add the movie to the main dictionary without character info
        elif len(role_list) == 0:
            movie_info = {}
            movie_info["Name"] = movies[i]
            movie_info["Number"] = i #number of movie
            movie_info["Role"] = role_list[j]
            movie_info["Rating"] = rating
            for k in range(2):
                movie_info["Genre " + str(k+1)] = genre_list[k]
            if addnone == False:
                data[count] = movie_info
            no_profs_data[count] = movie_info
            print("None --- %s seconds ---" % round((time.time() - start_time), 2))
            no_profs.append(movies[i])
            count += 1
        
    print(str(time.time() - starttt))
    return data, no_profs, no_profs_data
       
         
```

We will run this function on the first 1000 movies tagged 'professor.' I added some `print` statements to track the progress of the function and to see how many movies it skipped because there were no explicit professors.


```python
data, no_profs, no_profs_data = create_data(1000, True)
```

    --- 2.89 seconds ---
    skipping
    skipping
    --- 3.23 seconds ---
    skipping
    --- 2.31 seconds ---
    --- 1.53 seconds ---
    skipping
    --- 3.85 seconds ---
    skipping
    --- 3.13 seconds ---
    --- 2.75 seconds ---
    --- 4.95 seconds ---
    skipping
    --- 3.1 seconds ---
    skipping
    --- 3.15 seconds ---
    --- 2.86 seconds ---
    skipping
    --- 2.18 seconds ---
    skipping
    skipping
    skipping
    --- 1.48 seconds ---
    --- 3.78 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 1.65 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.68 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.58 seconds ---
    --- 3.72 seconds ---
    skipping
    --- 5.47 seconds ---
    --- 2.3 seconds ---
    skipping
    --- 3.02 seconds ---
    --- 2.1 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 3.46 seconds ---
    skipping
    --- 3.23 seconds ---
    --- 2.71 seconds ---
    skipping
    skipping
    skipping
    --- 1.8 seconds ---
    skipping
    skipping
    --- 2.07 seconds ---
    --- 2.18 seconds ---
    skipping
    --- 5.08 seconds ---
    skipping
    --- 2.07 seconds ---
    skipping
    skipping
    --- 2.41 seconds ---
    skipping
    skipping
    --- 2.39 seconds ---
    skipping
    --- 2.78 seconds ---
    --- 4.25 seconds ---
    skipping
    skipping
    --- 1.73 seconds ---
    skipping
    --- 2.28 seconds ---
    skipping
    skipping
    skipping
    --- 4.24 seconds ---
    --- 2.36 seconds ---
    --- 1.93 seconds ---
    --- 3.12 seconds ---
    --- 2.05 seconds ---
    --- 2.88 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.49 seconds ---
    --- 2.49 seconds ---
    --- 1.94 seconds ---
    --- 2.23 seconds ---
    --- 1.75 seconds ---
    skipping
    skipping
    --- 1.95 seconds ---
    --- 2.89 seconds ---
    skipping
    skipping
    --- 2.64 seconds ---
    skipping
    --- 2.52 seconds ---
    skipping
    skipping
    skipping
    --- 2.78 seconds ---
    skipping
    --- 2.38 seconds ---
    skipping
    --- 2.36 seconds ---
    --- 2.95 seconds ---
    skipping
    skipping
    --- 3.17 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 1.87 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 2.63 seconds ---
    skipping
    skipping
    skipping
    --- 4.31 seconds ---
    skipping
    --- 2.23 seconds ---
    skipping
    skipping
    --- 2.58 seconds ---
    --- 3.73 seconds ---
    skipping
    skipping
    --- 1.98 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.03 seconds ---
    --- 2.07 seconds ---
    --- 1.73 seconds ---
    skipping
    skipping
    --- 2.11 seconds ---
    skipping
    --- 2.22 seconds ---
    --- 2.3 seconds ---
    --- 1.83 seconds ---
    --- 2.77 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.76 seconds ---
    skipping
    --- 4.85 seconds ---
    skipping
    --- 2.22 seconds ---
    skipping
    --- 1.76 seconds ---
    --- 2.91 seconds ---
    skipping
    --- 2.06 seconds ---
    skipping
    skipping
    --- 2.4 seconds ---
    --- 1.85 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.02 seconds ---
    skipping
    --- 2.36 seconds ---
    skipping
    skipping
    skipping
    --- 2.03 seconds ---
    --- 1.83 seconds ---
    skipping
    skipping
    --- 1.66 seconds ---
    --- 1.65 seconds ---
    --- 1.8 seconds ---
    --- 2.9 seconds ---
    skipping
    --- 1.8 seconds ---
    --- 1.6 seconds ---
    --- 2.15 seconds ---
    skipping
    skipping
    --- 2.02 seconds ---
    --- 2.34 seconds ---
    --- 2.16 seconds ---
    skipping
    skipping
    skipping
    --- 2.56 seconds ---
    skipping
    --- 1.68 seconds ---
    --- 1.51 seconds ---
    skipping
    skipping
    skipping
    --- 2.07 seconds ---
    skipping
    --- 2.28 seconds ---
    skipping
    skipping
    --- 2.16 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 3.17 seconds ---
    skipping
    skipping
    --- 2.18 seconds ---
    --- 2.12 seconds ---
    skipping
    --- 2.11 seconds ---
    --- 2.29 seconds ---
    skipping
    --- 2.25 seconds ---
    --- 1.8 seconds ---
    --- 1.54 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 1.96 seconds ---
    skipping
    skipping
    --- 2.41 seconds ---
    skipping
    skipping
    skipping
    --- 2.64 seconds ---
    --- 2.06 seconds ---
    skipping
    skipping
    skipping
    --- 2.5 seconds ---
    --- 2.19 seconds ---
    --- 1.78 seconds ---
    --- 2.74 seconds ---
    skipping
    --- 2.44 seconds ---
    --- 1.59 seconds ---
    skipping
    --- 1.97 seconds ---
    skipping
    --- 2.19 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 2.47 seconds ---
    --- 2.1 seconds ---
    --- 1.82 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.01 seconds ---
    --- 1.87 seconds ---
    --- 1.85 seconds ---
    skipping
    --- 2.03 seconds ---
    --- 1.6 seconds ---
    --- 1.9 seconds ---
    skipping
    skipping
    --- 2.62 seconds ---
    --- 2.05 seconds ---
    --- 2.42 seconds ---
    skipping
    skipping
    skipping
    --- 2.03 seconds ---
    skipping
    skipping
    skipping
    --- 1.83 seconds ---
    --- 1.84 seconds ---
    skipping
    skipping
    skipping
    --- 1.61 seconds ---
    skipping
    --- 2.2 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.03 seconds ---
    --- 2.11 seconds ---
    skipping
    skipping
    --- 2.0 seconds ---
    --- 1.63 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 1.66 seconds ---
    skipping
    --- 2.56 seconds ---
    skipping
    skipping
    --- 1.66 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 2.24 seconds ---
    --- 1.97 seconds ---
    --- 2.52 seconds ---
    skipping
    skipping
    skipping
    --- 2.11 seconds ---
    skipping
    skipping
    --- 1.64 seconds ---
    skipping
    --- 3.41 seconds ---
    skipping
    skipping
    --- 2.07 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.17 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.04 seconds ---
    --- 2.31 seconds ---
    --- 1.94 seconds ---
    skipping
    --- 1.95 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.2 seconds ---
    skipping
    skipping
    skipping
    --- 2.1 seconds ---
    skipping
    skipping
    --- 2.18 seconds ---
    --- 1.83 seconds ---
    --- 3.21 seconds ---
    skipping
    --- 3.41 seconds ---
    --- 1.66 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 2.36 seconds ---
    skipping
    skipping
    skipping
    --- 2.22 seconds ---
    skipping
    skipping
    skipping
    --- 1.71 seconds ---
    skipping
    --- 1.95 seconds ---
    skipping
    --- 2.42 seconds ---
    skipping
    skipping
    --- 1.97 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.18 seconds ---
    skipping
    --- 2.16 seconds ---
    --- 2.28 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 1.69 seconds ---
    --- 1.84 seconds ---
    --- 2.13 seconds ---
    --- 1.7 seconds ---
    skipping
    --- 2.09 seconds ---
    --- 1.72 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 2.26 seconds ---
    --- 1.79 seconds ---
    skipping
    --- 1.78 seconds ---
    skipping
    --- 2.07 seconds ---
    skipping
    --- 2.24 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 1.48 seconds ---
    --- 1.71 seconds ---
    --- 2.43 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 1.93 seconds ---
    skipping
    skipping
    skipping
    --- 1.71 seconds ---
    skipping
    skipping
    skipping
    --- 2.32 seconds ---
    skipping
    skipping
    --- 1.73 seconds ---
    --- 1.81 seconds ---
    skipping
    skipping
    --- 1.59 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.19 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 1.78 seconds ---
    skipping
    skipping
    --- 2.1 seconds ---
    skipping
    --- 1.92 seconds ---
    --- 1.83 seconds ---
    skipping
    --- 2.8 seconds ---
    skipping
    --- 3.05 seconds ---
    --- 1.73 seconds ---
    --- 1.77 seconds ---
    skipping
    skipping
    skipping
    --- 1.87 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.0 seconds ---
    skipping
    --- 2.37 seconds ---
    skipping
    skipping
    --- 2.09 seconds ---
    skipping
    skipping
    --- 1.73 seconds ---
    --- 2.07 seconds ---
    skipping
    --- 1.95 seconds ---
    --- 1.99 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.05 seconds ---
    skipping
    --- 1.53 seconds ---
    --- 1.67 seconds ---
    --- 1.99 seconds ---
    skipping
    skipping
    --- 1.98 seconds ---
    skipping
    skipping
    --- 1.82 seconds ---
    skipping
    --- 2.06 seconds ---
    skipping
    --- 1.94 seconds ---
    --- 2.01 seconds ---
    skipping
    skipping
    skipping
    --- 1.67 seconds ---
    skipping
    skipping
    skipping
    --- 2.75 seconds ---
    skipping
    skipping
    --- 2.33 seconds ---
    skipping
    skipping
    skipping
    --- 1.96 seconds ---
    skipping
    skipping
    skipping
    --- 1.93 seconds ---
    --- 2.73 seconds ---
    skipping
    --- 1.68 seconds ---
    --- 1.98 seconds ---
    --- 1.94 seconds ---
    --- 1.6 seconds ---
    skipping
    --- 2.49 seconds ---
    skipping
    --- 2.19 seconds ---
    skipping
    --- 2.01 seconds ---
    skipping
    skipping
    --- 1.57 seconds ---
    skipping
    skipping
    --- 1.91 seconds ---
    skipping
    --- 2.32 seconds ---
    skipping
    --- 2.2 seconds ---
    skipping
    skipping
    skipping
    --- 2.61 seconds ---
    --- 2.35 seconds ---
    --- 2.25 seconds ---
    --- 2.44 seconds ---
    --- 2.41 seconds ---
    skipping
    skipping
    --- 2.97 seconds ---
    --- 3.1 seconds ---
    --- 2.25 seconds ---
    skipping
    --- 1.99 seconds ---
    skipping
    skipping
    --- 2.99 seconds ---
    skipping
    skipping
    --- 2.77 seconds ---
    skipping
    --- 1.44 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 1.83 seconds ---
    skipping
    skipping
    skipping
    --- 2.14 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.22 seconds ---
    skipping
    skipping
    skipping
    --- 2.15 seconds ---
    skipping
    skipping
    --- 2.1 seconds ---
    skipping
    skipping
    skipping
    --- 2.04 seconds ---
    --- 1.84 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 3.06 seconds ---
    skipping
    --- 1.93 seconds ---
    skipping
    skipping
    skipping
    --- 1.85 seconds ---
    --- 2.36 seconds ---
    skipping
    --- 2.09 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 1.74 seconds ---
    --- 2.75 seconds ---
    skipping
    skipping
    skipping
    --- 3.09 seconds ---
    --- 2.5 seconds ---
    skipping
    skipping
    skipping
    --- 2.51 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 3.13 seconds ---
    skipping
    skipping
    skipping
    --- 2.24 seconds ---
    --- 1.73 seconds ---
    skipping
    --- 1.82 seconds ---
    skipping
    skipping
    --- 1.83 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.18 seconds ---
    --- 2.14 seconds ---
    skipping
    skipping
    --- 1.42 seconds ---
    --- 2.43 seconds ---
    skipping
    --- 1.86 seconds ---
    skipping
    --- 1.86 seconds ---
    --- 2.16 seconds ---
    skipping
    --- 1.87 seconds ---
    skipping
    --- 2.37 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 2.36 seconds ---
    skipping
    --- 2.06 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 1.99 seconds ---
    --- 1.92 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 1.83 seconds ---
    --- 3.11 seconds ---
    --- 2.95 seconds ---
    --- 2.12 seconds ---
    skipping
    skipping
    skipping
    --- 2.27 seconds ---
    skipping
    --- 2.09 seconds ---
    skipping
    --- 2.13 seconds ---
    skipping
    skipping
    --- 2.19 seconds ---
    --- 2.62 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 1.94 seconds ---
    --- 2.07 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 2.72 seconds ---
    skipping
    skipping
    --- 2.28 seconds ---
    skipping
    --- 2.08 seconds ---
    --- 1.82 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.21 seconds ---
    skipping
    skipping
    --- 1.76 seconds ---
    skipping
    skipping
    --- 1.82 seconds ---
    skipping
    --- 3.71 seconds ---
    skipping
    --- 2.9 seconds ---
    skipping
    skipping
    skipping
    --- 1.8 seconds ---
    --- 2.09 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.07 seconds ---
    --- 2.94 seconds ---
    skipping
    --- 2.0 seconds ---
    skipping
    --- 2.17 seconds ---
    skipping
    skipping
    --- 2.6 seconds ---
    skipping
    skipping
    --- 2.09 seconds ---
    skipping
    skipping
    --- 1.91 seconds ---
    skipping
    skipping
    skipping
    --- 2.03 seconds ---
    --- 1.87 seconds ---
    skipping
    --- 2.28 seconds ---
    skipping
    --- 2.09 seconds ---
    --- 2.51 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 2.19 seconds ---
    --- 2.04 seconds ---
    skipping
    skipping
    skipping
    --- 1.63 seconds ---
    --- 1.85 seconds ---
    skipping
    skipping
    skipping
    --- 2.38 seconds ---
    skipping
    skipping
    skipping
    --- 2.29 seconds ---
    skipping
    --- 2.07 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.46 seconds ---
    skipping
    skipping
    --- 2.47 seconds ---
    --- 2.1 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 1.93 seconds ---
    skipping
    skipping
    skipping
    --- 2.55 seconds ---
    skipping
    --- 2.12 seconds ---
    skipping
    --- 1.78 seconds ---
    --- 2.14 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 2.28 seconds ---
    skipping
    skipping
    skipping
    --- 1.88 seconds ---
    --- 2.09 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.07 seconds ---
    skipping
    --- 1.84 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.0 seconds ---
    --- 1.82 seconds ---
    --- 2.91 seconds ---
    --- 2.37 seconds ---
    --- 1.84 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 2.16 seconds ---
    --- 3.07 seconds ---
    --- 2.33 seconds ---
    --- 2.63 seconds ---
    skipping
    --- 2.93 seconds ---
    skipping
    skipping
    skipping
    --- 1.92 seconds ---
    skipping
    skipping
    --- 2.38 seconds ---
    skipping
    skipping
    --- 2.66 seconds ---
    skipping
    skipping
    --- 1.97 seconds ---
    --- 2.76 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 2.15 seconds ---
    skipping
    skipping
    skipping
    --- 3.04 seconds ---
    skipping
    skipping
    --- 2.11 seconds ---
    --- 1.97 seconds ---
    --- 2.78 seconds ---
    --- 2.1 seconds ---
    --- 2.14 seconds ---
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    skipping
    --- 2.04 seconds ---
    skipping
    skipping
    skipping
    skipping
    --- 2.05 seconds ---
    skipping
    --- 2.17 seconds ---
    skipping
    skipping
    --- 1.93 seconds ---
    skipping
    skipping
    skipping
    --- 1.59 seconds ---
    skipping
    skipping
    --- 2.32 seconds ---
    skipping
    skipping
    skipping
    --- 1.89 seconds ---
    skipping
    skipping
    skipping
    --- 2.68 seconds ---
    skipping
    skipping
    skipping
    --- 2.49 seconds ---
    skipping
    skipping
    --- 2.18 seconds ---
    skipping
    skipping
    1539.8896362781525
    

This is the result of the dictionary created, pretiffied:


```python
import json
print(json.dumps(data, sort_keys=False, indent=4))
```

    {
        "0": {
            "Name": "Harry Potter and the Sorcerer's Stone",
            "Number": 0,
            "Year": "2001",
            "Actor": "Maggie Smith",
            "Role": "Professor McGonagall",
            "Rating": 64,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy"
        },
        "1": {
            "Name": "Harry Potter and the Sorcerer's Stone",
            "Number": 0,
            "Year": "2001",
            "Actor": "Ian Hart",
            "Role": "Professor Quirrell",
            "Rating": 64,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy"
        },
        "2": {
            "Name": "Harry Potter and the Sorcerer's Stone",
            "Number": 0,
            "Year": "2001",
            "Actor": "Alan Rickman",
            "Role": "Professor Snape",
            "Rating": 64,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy"
        },
        "3": {
            "Name": "Interstellar",
            "Number": 3,
            "Year": "2014",
            "Actor": "Michael Caine",
            "Role": "Professor Brand",
            "Rating": 74,
            "Genre 1": "Adventure",
            "Genre 2": "Drama",
            "Genre 3": "Sci-Fi"
        },
        "4": {
            "Name": "The Wizard of Oz",
            "Number": 5,
            "Year": "1939",
            "Actor": "Frank Morgan",
            "Role": "Professor Marvel",
            "Rating": 92,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy",
            "Genre 4": "Musical"
        },
        "5": {
            "Name": "The Bishop's Wife",
            "Number": 6,
            "Year": "1947",
            "Actor": "Monty Woolley",
            "Role": "Professor Wutheridge",
            "Rating": 72,
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Fantasy",
            "Genre 4": "Romance"
        },
        "6": {
            "Name": "Harry Potter and the Deathly Hallows: Part 2",
            "Number": 8,
            "Year": "2011",
            "Actor": "Michael Gambon",
            "Role": "Professor Albus Dumbledore",
            "Rating": 85,
            "Genre 1": "Adventure",
            "Genre 2": "Drama",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "7": {
            "Name": "Harry Potter and the Deathly Hallows: Part 2",
            "Number": 8,
            "Year": "2011",
            "Actor": "Alan Rickman",
            "Role": "Professor Severus Snape",
            "Rating": 85,
            "Genre 1": "Adventure",
            "Genre 2": "Drama",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "8": {
            "Name": "Harry Potter and the Deathly Hallows: Part 2",
            "Number": 8,
            "Year": "2011",
            "Actor": "Maggie Smith",
            "Role": "Professor Minerva McGonagall",
            "Rating": 85,
            "Genre 1": "Adventure",
            "Genre 2": "Drama",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "9": {
            "Name": "Harry Potter and the Deathly Hallows: Part 2",
            "Number": 8,
            "Year": "2011",
            "Actor": "Jim Broadbent",
            "Role": "Professor Horace Slughorn",
            "Rating": 85,
            "Genre 1": "Adventure",
            "Genre 2": "Drama",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "10": {
            "Name": "Harry Potter and the Deathly Hallows: Part 2",
            "Number": 8,
            "Year": "2011",
            "Actor": "Miriam Margolyes",
            "Role": "Professor Pomona Sprout",
            "Rating": 85,
            "Genre 1": "Adventure",
            "Genre 2": "Drama",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "11": {
            "Name": "Harry Potter and the Deathly Hallows: Part 2",
            "Number": 8,
            "Year": "2011",
            "Actor": "Emma Thompson",
            "Role": "Professor Sybil Trelawney",
            "Rating": 85,
            "Genre 1": "Adventure",
            "Genre 2": "Drama",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "12": {
            "Name": "Harry Potter and the Prisoner of Azkaban",
            "Number": 10,
            "Year": "2004",
            "Actor": "David Thewlis",
            "Role": "Professor Lupin",
            "Rating": 82,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "13": {
            "Name": "Harry Potter and the Prisoner of Azkaban",
            "Number": 10,
            "Year": "2004",
            "Actor": "Alan Rickman",
            "Role": "Professor Severus Snape",
            "Rating": 82,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "14": {
            "Name": "Harry Potter and the Prisoner of Azkaban",
            "Number": 10,
            "Year": "2004",
            "Actor": "Maggie Smith",
            "Role": "Professor Minerva McGonagall",
            "Rating": 82,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "15": {
            "Name": "Harry Potter and the Prisoner of Azkaban",
            "Number": 10,
            "Year": "2004",
            "Actor": "Emma Thompson",
            "Role": "Professor Sybil Trelawney",
            "Rating": 82,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "16": {
            "Name": "Harry Potter and the Chamber of Secrets",
            "Number": 11,
            "Year": "2002",
            "Actor": "Alan Rickman",
            "Role": "Professor Snape",
            "Rating": 63,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "17": {
            "Name": "Harry Potter and the Chamber of Secrets",
            "Number": 11,
            "Year": "2002",
            "Actor": "Maggie Smith",
            "Role": "Professor McGonagall",
            "Rating": 63,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "18": {
            "Name": "Harry Potter and the Chamber of Secrets",
            "Number": 11,
            "Year": "2002",
            "Actor": "Miriam Margolyes",
            "Role": "Professor Sprout",
            "Rating": 63,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "19": {
            "Name": "Harry Potter and the Chamber of Secrets",
            "Number": 11,
            "Year": "2002",
            "Actor": "Warwick Davis",
            "Role": "Professor Flitwick",
            "Rating": 63,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "20": {
            "Name": "Harry Potter and the Chamber of Secrets",
            "Number": 11,
            "Year": "2002",
            "Actor": "Alfred Burke",
            "Role": "Professor Dippet",
            "Rating": 63,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy",
            "Genre 4": "Mystery"
        },
        "21": {
            "Name": "The Chronicles of Narnia: The Lion, the Witch and the Wardrobe",
            "Number": 12,
            "Year": "2005",
            "Actor": "Jim Broadbent",
            "Role": "Professor Kirke",
            "Rating": 75,
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy"
        },
        "22": {
            "Name": "Harry Potter and the Order of the Phoenix",
            "Number": 14,
            "Year": "2007",
            "Actor": "Apple Brook",
            "Role": "Professor Grubbly-Plank",
            "Rating": 71,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Family",
            "Genre 4": "Fantasy"
        },
        "23": {
            "Name": "Kingsman: The Secret Service",
            "Number": 16,
            "Year": "2014",
            "Actor": "Mark Hamill",
            "Role": "Professor Arnold",
            "Rating": 60,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Comedy",
            "Genre 4": "Thriller"
        },
        "24": {
            "Name": "Harry Potter and the Half-Blood Prince",
            "Number": 17,
            "Year": "2009",
            "Actor": "Michael Gambon",
            "Role": "Professor Albus Dumbledore",
            "Rating": 78,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Family",
            "Genre 4": "Fantasy"
        },
        "25": {
            "Name": "Harry Potter and the Half-Blood Prince",
            "Number": 17,
            "Year": "2009",
            "Actor": "Jim Broadbent",
            "Role": "Professor Horace Slughorn",
            "Rating": 78,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Family",
            "Genre 4": "Fantasy"
        },
        "26": {
            "Name": "Harry Potter and the Half-Blood Prince",
            "Number": 17,
            "Year": "2009",
            "Actor": "Alan Rickman",
            "Role": "Professor Severus Snape",
            "Rating": 78,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Family",
            "Genre 4": "Fantasy"
        },
        "27": {
            "Name": "Harry Potter and the Half-Blood Prince",
            "Number": 17,
            "Year": "2009",
            "Actor": "Warwick Davis",
            "Role": "Professor Filius Flitwick",
            "Rating": 78,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Family",
            "Genre 4": "Fantasy"
        },
        "28": {
            "Name": "Harry Potter and the Half-Blood Prince",
            "Number": 17,
            "Year": "2009",
            "Actor": "Maggie Smith",
            "Role": "Professor Minerva McGonagall",
            "Rating": 78,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Family",
            "Genre 4": "Fantasy"
        },
        "29": {
            "Name": "Indiana Jones and the Last Crusade",
            "Number": 19,
            "Year": "1989",
            "Actor": "Sean Connery",
            "Role": "Professor Henry Jones",
            "Rating": 65,
            "Genre 1": "Action",
            "Genre 2": "Adventure"
        },
        "30": {
            "Name": "Indiana Jones and the Last Crusade",
            "Number": 19,
            "Year": "1989",
            "Actor": "Jerry Harte",
            "Role": "Professor Stanton",
            "Rating": 65,
            "Genre 1": "Action",
            "Genre 2": "Adventure"
        },
        "31": {
            "Name": "The Invisible Woman",
            "Number": 23,
            "Year": "1940",
            "Actor": "John Barrymore",
            "Role": "Professor Gibbs",
            "Rating": "35",
            "Genre 1": "Comedy",
            "Genre 2": "Romance",
            "Genre 3": "Sci-Fi"
        },
        "32": {
            "Name": "Fast & Furious Presents: Hobbs & Shaw",
            "Number": 24,
            "Year": "2019",
            "Actor": "Eddie Marsan",
            "Role": "Professor Andreiko",
            "Rating": 60,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Thriller"
        },
        "33": {
            "Name": "The Italian Job",
            "Number": 31,
            "Year": "1969",
            "Actor": "Benny Hill",
            "Role": "Professor Simon Peach",
            "Rating": 70,
            "Genre 1": "Action",
            "Genre 2": "Comedy",
            "Genre 3": "Crime",
            "Genre 4": "Thriller"
        },
        "34": {
            "Name": "A Beautiful Mind",
            "Number": 37,
            "Year": "2001",
            "Actor": "Victor Steinbach",
            "Role": "Professor Horner",
            "Rating": 72,
            "Genre 1": "Biography",
            "Genre 2": "Drama"
        },
        "35": {
            "Name": "Little Women",
            "Number": 43,
            "Year": "1949",
            "Actor": "Rossano Brazzi",
            "Role": "Professor Bhaer",
            "Rating": 61,
            "Genre 1": "Drama",
            "Genre 2": "Family",
            "Genre 3": "Romance"
        },
        "36": {
            "Name": "X-Men: Dark Phoenix",
            "Number": 44,
            "Year": "2019",
            "Actor": "James McAvoy",
            "Role": "Professor Charles Xavier",
            "Rating": 43,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Sci-Fi"
        },
        "37": {
            "Name": "X-Men: Apocalypse",
            "Number": 46,
            "Year": "2016",
            "Actor": "James McAvoy",
            "Role": "Professor Charles Xavier",
            "Rating": 52,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Sci-Fi"
        },
        "38": {
            "Name": "Dead Poets Society",
            "Number": 47,
            "Year": "1989",
            "Actor": "Joel Fogel",
            "Role": "Professor",
            "Rating": 79,
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "39": {
            "Name": "The Hitman's Bodyguard",
            "Number": 49,
            "Year": "2017",
            "Actor": "Rod Hallett",
            "Role": "Professor Asimov",
            "Rating": 47,
            "Genre 1": "Action",
            "Genre 2": "Comedy",
            "Genre 3": "Crime",
            "Genre 4": "Thriller"
        },
        "40": {
            "Name": "Lucy",
            "Number": 50,
            "Year": "2014",
            "Actor": "Morgan Freeman",
            "Role": "Professor Norman",
            "Rating": 61,
            "Genre 1": "Action",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Thriller"
        },
        "41": {
            "Name": "Lucy",
            "Number": 50,
            "Year": "2014",
            "Actor": "Bertrand Quoniam",
            "Role": "Professor",
            "Rating": 61,
            "Genre 1": "Action",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Thriller"
        },
        "42": {
            "Name": "Indiana Jones and the Kingdom of the Crystal Skull",
            "Number": 55,
            "Year": "2008",
            "Actor": "John Hurt",
            "Role": "Professor Oxley",
            "Rating": 65,
            "Genre 1": "Action",
            "Genre 2": "Adventure"
        },
        "43": {
            "Name": "Inferno",
            "Number": 57,
            "Year": "2016",
            "Actor": "Philip Arditti",
            "Role": "Professor (Istanbul)",
            "Rating": 42,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Crime",
            "Genre 4": "Drama"
        },
        "44": {
            "Name": "X-Men",
            "Number": 58,
            "Year": "2000",
            "Actor": "Patrick Stewart",
            "Role": "Professor Charles Xavier",
            "Rating": 64,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Sci-Fi"
        },
        "45": {
            "Name": "Barbarella",
            "Number": 62,
            "Year": "1968",
            "Actor": "Marcel Marceau",
            "Role": "Professor Ping",
            "Rating": 51,
            "Genre 1": "Adventure",
            "Genre 2": "Comedy",
            "Genre 3": "Fantasy",
            "Genre 4": "Sci-Fi"
        },
        "46": {
            "Name": "Dr. No",
            "Number": 65,
            "Year": "1962",
            "Actor": "Anthony Dawson",
            "Role": "Professor Dent",
            "Rating": 78,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Thriller"
        },
        "47": {
            "Name": "Downfall",
            "Number": 66,
            "Year": "2004",
            "Actor": "Christian Berkel",
            "Role": "Prof. Ernst-G\u00fcnther Schenck",
            "Rating": 82,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "History",
            "Genre 4": "War"
        },
        "48": {
            "Name": "Downfall",
            "Number": 66,
            "Year": "2004",
            "Actor": "Matthias Habich",
            "Role": "Prof. Werner Haase",
            "Rating": 82,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "History",
            "Genre 4": "War"
        },
        "49": {
            "Name": "X-Men: Days of Future Past",
            "Number": 68,
            "Year": "2014",
            "Actor": "Patrick Stewart",
            "Role": "Professor X",
            "Rating": 75,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Sci-Fi",
            "Genre 4": "Thriller"
        },
        "50": {
            "Name": "3 Idiots",
            "Number": 70,
            "Year": "2009",
            "Actor": "Raghunathan",
            "Role": "Professor in Corridor",
            "Rating": 67,
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "51": {
            "Name": "3 Idiots",
            "Number": 70,
            "Year": "2009",
            "Actor": "Vaidyanathan",
            "Role": "Professor Vaidyanathan",
            "Rating": 67,
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "52": {
            "Name": "3 Idiots",
            "Number": 70,
            "Year": "2009",
            "Actor": "Tanveer Ahmed",
            "Role": "Professor in Induction Motor Class",
            "Rating": 67,
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "53": {
            "Name": "Richie Rich",
            "Number": 73,
            "Year": "1994",
            "Actor": "Michael McShane",
            "Role": "Professor Keenbean",
            "Rating": 49,
            "Genre 1": "Comedy",
            "Genre 2": "Family"
        },
        "54": {
            "Name": "Legally Blonde",
            "Number": 76,
            "Year": "2001",
            "Actor": "Victor Garber",
            "Role": "Professor Callahan",
            "Rating": 59,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "55": {
            "Name": "Legally Blonde",
            "Number": 76,
            "Year": "2001",
            "Actor": "Holland Taylor",
            "Role": "Professor Stromwell",
            "Rating": 59,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "56": {
            "Name": "The Hurt Locker",
            "Number": 78,
            "Year": "2008",
            "Actor": "Nabil Koni",
            "Role": "Professor Nabil",
            "Rating": 95,
            "Genre 1": "Drama",
            "Genre 2": "Thriller",
            "Genre 3": "War"
        },
        "57": {
            "Name": "Hellboy",
            "Number": 79,
            "Year": "2019",
            "Actor": "Ian McShane",
            "Role": "Professor Broom",
            "Rating": 31,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Fantasy",
            "Genre 4": "Horror"
        },
        "58": {
            "Name": "Hellboy",
            "Number": 79,
            "Year": "2019",
            "Actor": "Ilko Iliev",
            "Role": "Professor Doctor Karl Ruprect Kroenen",
            "Rating": 31,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Fantasy",
            "Genre 4": "Horror"
        },
        "59": {
            "Name": "My Fair Lady",
            "Number": 82,
            "Year": "1964",
            "Actor": "Rex Harrison",
            "Role": "Professor Henry Higgins",
            "Rating": 95,
            "Genre 1": "Drama",
            "Genre 2": "Family",
            "Genre 3": "Musical",
            "Genre 4": "Romance"
        },
        "60": {
            "Name": "Radioactive",
            "Number": 84,
            "Year": "2019",
            "Actor": "Simon Russell Beale",
            "Role": "Professor Lippmann",
            "Rating": 56,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "61": {
            "Name": "The Aviator",
            "Number": 88,
            "Year": "2004",
            "Actor": "Ian Holm",
            "Role": "Professor Fitz",
            "Rating": 77,
            "Genre 1": "Biography",
            "Genre 2": "Drama"
        },
        "62": {
            "Name": "Mars Attacks!",
            "Number": 89,
            "Year": "1996",
            "Actor": "Pierce Brosnan",
            "Role": "Professor Donald Kessler",
            "Rating": 52,
            "Genre 1": "Comedy",
            "Genre 2": "Sci-Fi"
        },
        "63": {
            "Name": "The Butterfly Effect",
            "Number": 90,
            "Year": "2004",
            "Actor": "John B. Lowe",
            "Role": "Professor Carter",
            "Rating": 30,
            "Genre 1": "Drama",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Thriller"
        },
        "64": {
            "Name": "Sherlock Holmes: A Game of Shadows",
            "Number": 91,
            "Year": "2011",
            "Actor": "Jared Harris",
            "Role": "Professor James Moriarty",
            "Rating": 48,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Mystery"
        },
        "65": {
            "Name": "Lolita",
            "Number": 92,
            "Year": "1962",
            "Actor": "James Mason",
            "Role": "Prof. Humbert Humbert",
            "Rating": 79,
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "66": {
            "Name": "Criminal",
            "Number": 93,
            "Year": "2016",
            "Actor": "Nathan Osgood",
            "Role": "Professor Callowell",
            "Rating": 36,
            "Genre 1": "Action",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Thriller"
        },
        "67": {
            "Name": "Stranger Than Fiction",
            "Number": 100,
            "Year": "2006",
            "Actor": "Dustin Hoffman",
            "Role": "Professor Jules Hilbert",
            "Rating": 67,
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Fantasy",
            "Genre 4": "Romance"
        },
        "68": {
            "Name": "The Waterboy",
            "Number": 101,
            "Year": "1998",
            "Actor": "Robert Kokol",
            "Role": "Professor",
            "Rating": 41,
            "Genre 1": "Comedy",
            "Genre 2": "Sport"
        },
        "69": {
            "Name": "Roma",
            "Number": 102,
            "Year": "2018",
            "Actor": "Latin Lover",
            "Role": "Profesor Zovek",
            "Rating": 96,
            "Genre 1": "Drama"
        },
        "70": {
            "Name": "21",
            "Number": 103,
            "Year": "2008",
            "Actor": "Colin Angle",
            "Role": "Professor Hanes",
            "Rating": 48,
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "History",
            "Genre 4": "Thriller"
        },
        "71": {
            "Name": "21",
            "Number": 103,
            "Year": "2008",
            "Actor": "Supriya Chakrabarti",
            "Role": "Professor",
            "Rating": 48,
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "History",
            "Genre 4": "Thriller"
        },
        "72": {
            "Name": "Stalker",
            "Number": 104,
            "Year": "1979",
            "Actor": "Sergey Yakovlev",
            "Role": "Professor",
            "Rating": "162",
            "Genre 1": "Drama",
            "Genre 2": "Sci-Fi"
        },
        "73": {
            "Name": "Cannibal Holocaust",
            "Number": 107,
            "Year": "1980",
            "Actor": "Robert Kerman",
            "Role": "Professor Harold Monroe",
            "Rating": 22,
            "Genre 1": "Adventure",
            "Genre 2": "Horror"
        },
        "74": {
            "Name": "X2: X-Men United",
            "Number": 108,
            "Year": "2003",
            "Actor": "Patrick Stewart",
            "Role": "Professor Charles Xavier",
            "Rating": 68,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Sci-Fi",
            "Genre 4": "Thriller"
        },
        "75": {
            "Name": "Isle of Dogs",
            "Number": 111,
            "Year": "2018",
            "Actor": "Akira Ito",
            "Role": "Professor Watanabe",
            "Rating": 82,
            "Genre 1": "Animation",
            "Genre 2": "Adventure",
            "Genre 3": "Comedy",
            "Genre 4": "Drama"
        },
        "76": {
            "Name": "Tolkien",
            "Number": 113,
            "Year": "2019",
            "Actor": "Colin Burnie",
            "Role": "Professor #1",
            "Rating": 48,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "Romance",
            "Genre 4": "War"
        },
        "77": {
            "Name": "Tolkien",
            "Number": 113,
            "Year": "2019",
            "Actor": "Derek Jacobi",
            "Role": "Professor Wright",
            "Rating": 48,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "Romance",
            "Genre 4": "War"
        },
        "78": {
            "Name": "Tolkien",
            "Number": 113,
            "Year": "2019",
            "Actor": "Andy Orchard",
            "Role": "Professor #2",
            "Rating": 48,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "Romance",
            "Genre 4": "War"
        },
        "79": {
            "Name": "Timeline",
            "Number": 117,
            "Year": "2003",
            "Actor": "Billy Connolly",
            "Role": "Professor Johnston",
            "Rating": 28,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Sci-Fi",
            "Genre 4": "War"
        },
        "80": {
            "Name": "Scary Movie 2",
            "Number": 119,
            "Year": "2001",
            "Actor": "Tim Curry",
            "Role": "Professor",
            "Rating": 29,
            "Genre 1": "Comedy",
            "Genre 2": "Horror"
        },
        "81": {
            "Name": "Fallen",
            "Number": 121,
            "Year": "1998",
            "Actor": "Christian Aubert",
            "Role": "Professor Louders",
            "Rating": "65",
            "Genre 1": "Action",
            "Genre 2": "Crime",
            "Genre 3": "Drama",
            "Genre 4": "Fantasy"
        },
        "82": {
            "Name": "Never Look Away",
            "Number": 122,
            "Year": "2018",
            "Actor": "Sebastian Koch",
            "Role": "Professor Carl Seeband",
            "Rating": 68,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "Romance",
            "Genre 4": "Thriller"
        },
        "83": {
            "Name": "Never Look Away",
            "Number": 122,
            "Year": "2018",
            "Actor": "Oliver Masucci",
            "Role": "Professor Antonius van Verten",
            "Rating": 68,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "Romance",
            "Genre 4": "Thriller"
        },
        "84": {
            "Name": "Never Look Away",
            "Number": 122,
            "Year": "2018",
            "Actor": "Hans-Uwe Bauer",
            "Role": "Professor Horst Grimma",
            "Rating": 68,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "Romance",
            "Genre 4": "Thriller"
        },
        "85": {
            "Name": "Transformers: Revenge of the Fallen",
            "Number": 125,
            "Year": "2009",
            "Actor": "Rainn Wilson",
            "Role": "Professor Colan",
            "Rating": 35,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Sci-Fi"
        },
        "86": {
            "Name": "Ghost Stories",
            "Number": 133,
            "Year": "2017",
            "Actor": "Andy Nyman",
            "Role": "Professor Goodman",
            "Rating": 68,
            "Genre 1": "Drama",
            "Genre 2": "Horror"
        },
        "87": {
            "Name": "Unknown",
            "Number": 138,
            "Year": "2011",
            "Actor": "Sebastian Koch",
            "Role": "Professor Bressler",
            "Rating": 56,
            "Genre 1": "Action",
            "Genre 2": "Thriller"
        },
        "88": {
            "Name": "Tarzan",
            "Number": 142,
            "Year": "1999",
            "Actor": "Nigel Hawthorne",
            "Role": "Professor Porter",
            "Rating": 79,
            "Genre 1": "Animation",
            "Genre 2": "Adventure",
            "Genre 3": "Family"
        },
        "89": {
            "Name": "The Rewrite",
            "Number": 144,
            "Year": "2014",
            "Actor": "Allison Janney",
            "Role": "Professor Weldon",
            "Rating": 51,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "90": {
            "Name": "Back to School",
            "Number": 147,
            "Year": "1986",
            "Actor": "Sam Kinison",
            "Role": "Professor Terguson",
            "Rating": 68,
            "Genre 1": "Comedy",
            "Genre 2": "Romance",
            "Genre 3": "Sport"
        },
        "91": {
            "Name": "Suspiria",
            "Number": 148,
            "Year": "1977",
            "Actor": "Rudolf Sch\u00fcndler",
            "Role": "Prof. Milius",
            "Rating": 79,
            "Genre 1": "Horror"
        },
        "92": {
            "Name": "Suspiria",
            "Number": 148,
            "Year": "1977",
            "Actor": "Renato Scarpa",
            "Role": "Prof. Verdegast",
            "Rating": 79,
            "Genre 1": "Horror"
        },
        "93": {
            "Name": "Solaris",
            "Number": 151,
            "Year": "1972",
            "Actor": "Bagrat Oganesyan",
            "Role": "Professor Tarkhe",
            "Rating": 90,
            "Genre 1": "Drama",
            "Genre 2": "Mystery",
            "Genre 3": "Sci-Fi"
        },
        "94": {
            "Name": "Solaris",
            "Number": 151,
            "Year": "1972",
            "Actor": "Georgiy Teykh",
            "Role": "Professor Messendzher",
            "Rating": 90,
            "Genre 1": "Drama",
            "Genre 2": "Mystery",
            "Genre 3": "Sci-Fi"
        },
        "95": {
            "Name": "Carry on Behind",
            "Number": 159,
            "Year": "1975",
            "Actor": "Elke Sommer",
            "Role": "Professor Anna Vooshka",
            "Rating": "5",
            "Genre 1": "Comedy"
        },
        "96": {
            "Name": "Carry on Behind",
            "Number": 159,
            "Year": "1975",
            "Actor": "Kenneth Williams",
            "Role": "Professor Roland Crump",
            "Rating": "5",
            "Genre 1": "Comedy"
        },
        "97": {
            "Name": "The Titan",
            "Number": 160,
            "Year": "2018",
            "Actor": "Tom Wilkinson",
            "Role": "Prof. Martin Collingwood",
            "Rating": 33,
            "Genre 1": "Drama",
            "Genre 2": "Mystery",
            "Genre 3": "Romance",
            "Genre 4": "Sci-Fi"
        },
        "98": {
            "Name": "Heavenly Creatures",
            "Number": 161,
            "Year": "1994",
            "Actor": "Michael Maxwell",
            "Role": "Professor",
            "Rating": "109",
            "Genre 1": "Biography",
            "Genre 2": "Crime",
            "Genre 3": "Drama",
            "Genre 4": "Thriller"
        },
        "99": {
            "Name": "Candyman",
            "Number": 164,
            "Year": "1992",
            "Actor": "Michael Culkin",
            "Role": "Professor Philip Purcell",
            "Rating": 61,
            "Genre 1": "Horror",
            "Genre 2": "Thriller"
        },
        "100": {
            "Name": "Real Genius",
            "Number": 166,
            "Year": "1985",
            "Actor": "William Atherton",
            "Role": "Prof. Jerry Hathaway",
            "Rating": 71,
            "Genre 1": "Comedy",
            "Genre 2": "Romance",
            "Genre 3": "Sci-Fi"
        },
        "101": {
            "Name": "A Dangerous Method",
            "Number": 167,
            "Year": "2011",
            "Actor": "Andr\u00e9 Hennicke",
            "Role": "Prof. Eugen Bleuler",
            "Rating": 76,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "Romance",
            "Genre 4": "Thriller"
        },
        "102": {
            "Name": "Urban Legend",
            "Number": 168,
            "Year": "1998",
            "Actor": "Robert Englund",
            "Role": "Professor William Wexler",
            "Rating": 35,
            "Genre 1": "Horror",
            "Genre 2": "Mystery",
            "Genre 3": "Thriller"
        },
        "103": {
            "Name": "Little Women",
            "Number": 169,
            "Year": "1933",
            "Actor": "Paul Lukas",
            "Role": "Professor Bhaer",
            "Rating": 92,
            "Genre 1": "Drama",
            "Genre 2": "Family",
            "Genre 3": "Romance",
            "Genre 4": "War"
        },
        "104": {
            "Name": "Wall Street: Money Never Sleeps",
            "Number": 176,
            "Year": "2010",
            "Actor": "Faye Wattleton",
            "Role": "Professor at Fordham",
            "Rating": 59,
            "Genre 1": "Drama"
        },
        "105": {
            "Name": "The Day the Earth Stood Still",
            "Number": 178,
            "Year": "2008",
            "Actor": "John Cleese",
            "Role": "Professor Barnhardt",
            "Rating": 40,
            "Genre 1": "Drama",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Thriller"
        },
        "106": {
            "Name": "In the Line of Fire",
            "Number": 180,
            "Year": "1993",
            "Actor": "John Heard",
            "Role": "Professor Riger",
            "Rating": 74,
            "Genre 1": "Action",
            "Genre 2": "Crime",
            "Genre 3": "Drama",
            "Genre 4": "Thriller"
        },
        "107": {
            "Name": "Nosferatu",
            "Number": 182,
            "Year": "1922",
            "Actor": "Gustav Botz",
            "Role": "Professor Sievers - der Stadtarzt",
            "Rating": "210",
            "Genre 1": "Fantasy",
            "Genre 2": "Horror"
        },
        "108": {
            "Name": "Nosferatu",
            "Number": 182,
            "Year": "1922",
            "Actor": "John Gottowt",
            "Role": "Professor Bulwer - ein Paracelsianer",
            "Rating": "210",
            "Genre 1": "Fantasy",
            "Genre 2": "Horror"
        },
        "109": {
            "Name": "Miss Fisher & the Crypt of Tears",
            "Number": 183,
            "Year": "2020",
            "Actor": "John Waters",
            "Role": "Professor Linnaeus",
            "Rating": "14",
            "Genre 1": "Adventure",
            "Genre 2": "Drama",
            "Genre 3": "Mystery"
        },
        "110": {
            "Name": "Congo",
            "Number": 185,
            "Year": "1995",
            "Actor": "Lawrence T. Wrentz",
            "Role": "Prof. Arliss Wender",
            "Rating": 22,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Mystery",
            "Genre 4": "Sci-Fi"
        },
        "111": {
            "Name": "Frankenstein",
            "Number": 188,
            "Year": "1994",
            "Actor": "John Cleese",
            "Role": "Professor Waldman",
            "Rating": "99",
            "Genre 1": "Drama",
            "Genre 2": "Horror",
            "Genre 3": "Romance",
            "Genre 4": "Sci-Fi"
        },
        "112": {
            "Name": "Frankenstein",
            "Number": 188,
            "Year": "1994",
            "Actor": "Robert Hardy",
            "Role": "Professor Krempe",
            "Rating": "99",
            "Genre 1": "Drama",
            "Genre 2": "Horror",
            "Genre 3": "Romance",
            "Genre 4": "Sci-Fi"
        },
        "113": {
            "Name": "The Red Shoes",
            "Number": 189,
            "Year": "1948",
            "Actor": "Austin Trevor",
            "Role": "Professor Palmer",
            "Rating": "116",
            "Genre 1": "Drama",
            "Genre 2": "Music",
            "Genre 3": "Romance"
        },
        "114": {
            "Name": "The Day the Earth Stood Still",
            "Number": 196,
            "Year": "1951",
            "Actor": "Sam Jaffe",
            "Role": "Professor Jacob Barnhardt",
            "Rating": "136",
            "Genre 1": "Drama",
            "Genre 2": "Sci-Fi"
        },
        "115": {
            "Name": "Jason X",
            "Number": 198,
            "Year": "2001",
            "Actor": "Jonathan Potts",
            "Role": "Professor Lowe",
            "Rating": 25,
            "Genre 1": "Action",
            "Genre 2": "Horror",
            "Genre 3": "Sci-Fi",
            "Genre 4": "Thriller"
        },
        "116": {
            "Name": "Fatima",
            "Number": 202,
            "Year": "2020",
            "Actor": "Harvey Keitel",
            "Role": "Professor Nichols",
            "Rating": 51,
            "Genre 1": "Drama",
            "Genre 2": "War"
        },
        "117": {
            "Name": "Runaway Jury",
            "Number": 203,
            "Year": "2003",
            "Actor": "Peter Jurasik",
            "Role": "Professor Phelan",
            "Rating": 61,
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Thriller"
        },
        "118": {
            "Name": "On the Town",
            "Number": 206,
            "Year": "1949",
            "Actor": "George Meader",
            "Role": "Professor",
            "Rating": 71,
            "Genre 1": "Comedy",
            "Genre 2": "Musical",
            "Genre 3": "Romance"
        },
        "119": {
            "Name": "Funny Face",
            "Number": 207,
            "Year": "1957",
            "Actor": "Michel Auclair",
            "Role": "Prof. Emile Flostre",
            "Rating": "84",
            "Genre 1": "Comedy",
            "Genre 2": "Musical",
            "Genre 3": "Romance"
        },
        "120": {
            "Name": "Marathon Man",
            "Number": 208,
            "Year": "1976",
            "Actor": "Fritz Weaver",
            "Role": "Professor Biesenthal",
            "Rating": 64,
            "Genre 1": "Crime",
            "Genre 2": "Thriller"
        },
        "121": {
            "Name": "The Roommate",
            "Number": 209,
            "Year": "2011",
            "Actor": "Billy Zane",
            "Role": "Professor Roberts",
            "Rating": 23,
            "Genre 1": "Thriller"
        },
        "122": {
            "Name": "The Ladykillers",
            "Number": 211,
            "Year": "2004",
            "Actor": "Tom Hanks",
            "Role": "Professor G.H. Dorr",
            "Rating": 56,
            "Genre 1": "Comedy",
            "Genre 2": "Crime",
            "Genre 3": "Thriller"
        },
        "123": {
            "Name": "Strangers on a Train",
            "Number": 212,
            "Year": "1951",
            "Actor": "John Brown",
            "Role": "Prof. Collins",
            "Rating": 88,
            "Genre 1": "Crime",
            "Genre 2": "Film-Noir",
            "Genre 3": "Thriller"
        },
        "124": {
            "Name": "Irrational Man",
            "Number": 213,
            "Year": "2015",
            "Actor": "Nancy Carroll",
            "Role": "Professor",
            "Rating": 53,
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "125": {
            "Name": "Irrational Man",
            "Number": 213,
            "Year": "2015",
            "Actor": "Tamara Hickey",
            "Role": "Professor in Cafeteria",
            "Rating": 53,
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "126": {
            "Name": "Kill Your Darlings",
            "Number": 216,
            "Year": "2013",
            "Actor": "John Cullum",
            "Role": "Professor Steeves",
            "Rating": 65,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "Romance",
            "Genre 4": "Thriller"
        },
        "127": {
            "Name": "20,000 Leagues Under the Sea",
            "Number": 217,
            "Year": "1954",
            "Actor": "Paul Lukas",
            "Role": "Prof. Pierre Aronnax",
            "Rating": 83,
            "Genre 1": "Adventure",
            "Genre 2": "Drama",
            "Genre 3": "Family",
            "Genre 4": "Fantasy"
        },
        "128": {
            "Name": "Young Sherlock Holmes",
            "Number": 218,
            "Year": "1985",
            "Actor": "Anthony Higgins",
            "Role": "Professor Rathe",
            "Rating": 65,
            "Genre 1": "Adventure",
            "Genre 2": "Fantasy",
            "Genre 3": "Mystery",
            "Genre 4": "Thriller"
        },
        "129": {
            "Name": "Flubber",
            "Number": 222,
            "Year": "1997",
            "Actor": "Robin Williams",
            "Role": "Professor Philip Brainard",
            "Rating": 37,
            "Genre 1": "Comedy",
            "Genre 2": "Family",
            "Genre 3": "Sci-Fi"
        },
        "130": {
            "Name": "King Solomon's Mines",
            "Number": 224,
            "Year": "1985",
            "Actor": "Bernard Archard",
            "Role": "Prof. Huston",
            "Rating": 29,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Comedy",
            "Genre 4": "Romance"
        },
        "131": {
            "Name": "Dance of the Vampires",
            "Number": 225,
            "Year": "1967",
            "Actor": "Jack MacGowran",
            "Role": "Professor Abronsius",
            "Rating": 56,
            "Genre 1": "Comedy",
            "Genre 2": "Horror"
        },
        "132": {
            "Name": "Eteros ego",
            "Number": 229,
            "Year": "2016",
            "Actor": "Pigmalion Dadakaridis",
            "Role": "Professor Dimitris Lainis",
            "Rating": "4",
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Mystery",
            "Genre 4": "Thriller"
        },
        "133": {
            "Name": "The Human Stain",
            "Number": 231,
            "Year": "2003",
            "Actor": "Mimi Kuzyk",
            "Role": "Professor Delphine Roux",
            "Rating": 57,
            "Genre 1": "Drama",
            "Genre 2": "Romance",
            "Genre 3": "Thriller"
        },
        "134": {
            "Name": "The Prince and Me",
            "Number": 234,
            "Year": "2004",
            "Actor": "Jacques Tourangeau",
            "Role": "Professor Amiel",
            "Rating": 47,
            "Genre 1": "Comedy",
            "Genre 2": "Family",
            "Genre 3": "Romance"
        },
        "135": {
            "Name": "The Prince and Me",
            "Number": 234,
            "Year": "2004",
            "Actor": "Stephen Singer",
            "Role": "Professor Begler",
            "Rating": 47,
            "Genre 1": "Comedy",
            "Genre 2": "Family",
            "Genre 3": "Romance"
        },
        "136": {
            "Name": "Away We Go",
            "Number": 239,
            "Year": "2009",
            "Actor": "Finnerty Steeves",
            "Role": "Professor Ruby",
            "Rating": 58,
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "137": {
            "Name": "To Be or Not to Be",
            "Number": 242,
            "Year": "1942",
            "Actor": "Stanley Ridges",
            "Role": "Professor Siletsky",
            "Rating": 86,
            "Genre 1": "Comedy",
            "Genre 2": "War"
        },
        "138": {
            "Name": "Kinsey",
            "Number": 243,
            "Year": "2004",
            "Actor": "Clifford David",
            "Role": "Professor Smithson",
            "Rating": 79,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "139": {
            "Name": "Deep Red",
            "Number": 245,
            "Year": "1975",
            "Actor": "Glauco Mauri",
            "Role": "Prof. Giordani",
            "Rating": 89,
            "Genre 1": "Horror",
            "Genre 2": "Mystery",
            "Genre 3": "Thriller"
        },
        "140": {
            "Name": "Quiz Show",
            "Number": 246,
            "Year": "1994",
            "Actor": "Dan Wakefield",
            "Role": "Professors at Book Party",
            "Rating": 92,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "History"
        },
        "141": {
            "Name": "Quiz Show",
            "Number": 246,
            "Year": "1994",
            "Actor": "Hamilton Fish",
            "Role": "Professor at Book Party",
            "Rating": 92,
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "History"
        },
        "142": {
            "Name": "My Best Friend's Girl",
            "Number": 248,
            "Year": "2008",
            "Actor": "Alec Baldwin",
            "Role": "Professor Turner",
            "Rating": 34,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "143": {
            "Name": "The Sentinel",
            "Number": 249,
            "Year": "1977",
            "Actor": "Martin Balsam",
            "Role": "Professor Ruzinsky",
            "Rating": "101",
            "Genre 1": "Horror"
        },
        "144": {
            "Name": "The Sentinel",
            "Number": 249,
            "Year": "1977",
            "Actor": "Mady Kaplan",
            "Role": "Professor's student",
            "Rating": "101",
            "Genre 1": "Horror"
        },
        "145": {
            "Name": "The Conformist",
            "Number": 250,
            "Year": "1970",
            "Actor": "Enzo Tarascio",
            "Role": "Professor Quadri",
            "Rating": 100,
            "Genre 1": "Drama"
        },
        "146": {
            "Name": "God's Not Dead",
            "Number": 264,
            "Year": "2014",
            "Actor": "Kevin Sorbo",
            "Role": "Professor Radisson",
            "Rating": 16,
            "Genre 1": "Drama"
        },
        "147": {
            "Name": "God's Not Dead",
            "Number": 264,
            "Year": "2014",
            "Actor": "Bethel Kurchner",
            "Role": "Professor Radisson's Mom",
            "Rating": 16,
            "Genre 1": "Drama"
        },
        "148": {
            "Name": "Phenomenon",
            "Number": 267,
            "Year": "1996",
            "Actor": "Jeffrey DeMunn",
            "Role": "Professor Ringold",
            "Rating": 41,
            "Genre 1": "Drama",
            "Genre 2": "Fantasy",
            "Genre 3": "Romance",
            "Genre 4": "Sci-Fi"
        },
        "149": {
            "Name": "Man of the House",
            "Number": 271,
            "Year": "2005",
            "Actor": "Anne Archer",
            "Role": "Professor Molly McCarthy",
            "Rating": 35,
            "Genre 1": "Comedy",
            "Genre 2": "Crime"
        },
        "150": {
            "Name": "Soul Man",
            "Number": 272,
            "Year": "1986",
            "Actor": "James Earl Jones",
            "Role": "Professor Banks",
            "Rating": 33,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "151": {
            "Name": "Captain Underpants: The First Epic Movie",
            "Number": 276,
            "Year": "2017",
            "Actor": "Nick Kroll",
            "Role": "Professor Poopypants",
            "Rating": 69,
            "Genre 1": "Animation",
            "Genre 2": "Action",
            "Genre 3": "Comedy",
            "Genre 4": "Family"
        },
        "152": {
            "Name": "Crimes and Misdemeanors",
            "Number": 277,
            "Year": "1989",
            "Actor": "Martin Bergmann",
            "Role": "Professor Louis Levy",
            "Rating": 77,
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "153": {
            "Name": "The 39 Steps",
            "Number": 278,
            "Year": "1935",
            "Actor": "Godfrey Tearle",
            "Role": "Professor Jordan",
            "Rating": 93,
            "Genre 1": "Crime",
            "Genre 2": "Mystery",
            "Genre 3": "Thriller"
        },
        "154": {
            "Name": "Denial",
            "Number": 279,
            "Year": "2016",
            "Actor": "Mark Gatiss",
            "Role": "Prof. Robert Jan Van Pelt",
            "Rating": 63,
            "Genre 1": "Biography",
            "Genre 2": "Drama"
        },
        "155": {
            "Name": "Denial",
            "Number": 279,
            "Year": "2016",
            "Actor": "John Sessions",
            "Role": "Prof. Richard Evans",
            "Rating": 63,
            "Genre 1": "Biography",
            "Genre 2": "Drama"
        },
        "156": {
            "Name": "Lions for Lambs",
            "Number": 281,
            "Year": "2007",
            "Actor": "Robert Redford",
            "Role": "Professor Stephen Malley",
            "Rating": 47,
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Mystery",
            "Genre 4": "Thriller"
        },
        "157": {
            "Name": "Hercules in New York",
            "Number": 282,
            "Year": "1970",
            "Actor": "James Karen",
            "Role": "Professor Camden",
            "Rating": 23,
            "Genre 1": "Adventure",
            "Genre 2": "Comedy",
            "Genre 3": "Fantasy"
        },
        "158": {
            "Name": "Phenomena",
            "Number": 284,
            "Year": "1985",
            "Actor": "Donald Pleasence",
            "Role": "Professor John McGregor",
            "Rating": 57,
            "Genre 1": "Crime",
            "Genre 2": "Horror",
            "Genre 3": "Mystery"
        },
        "159": {
            "Name": "The Fantastic Four",
            "Number": 286,
            "Year": "1994",
            "Actor": "George Gaynes",
            "Role": "Professor",
            "Rating": "59",
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Family",
            "Genre 4": "Sci-Fi"
        },
        "160": {
            "Name": "Little Nemo: Adventures in Slumberland",
            "Number": 291,
            "Year": "1989",
            "Actor": "Rene Auberjonois",
            "Role": "Professor Genius",
            "Rating": "25",
            "Genre 1": "Animation",
            "Genre 2": "Adventure",
            "Genre 3": "Comedy",
            "Genre 4": "Family"
        },
        "161": {
            "Name": "Going the Distance",
            "Number": 292,
            "Year": "2010",
            "Actor": "Terry Beaver",
            "Role": "Professor",
            "Rating": 51,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "162": {
            "Name": "Torn Curtain",
            "Number": 293,
            "Year": "1966",
            "Actor": "Paul Newman",
            "Role": "Professor Michael Armstrong",
            "Rating": 55,
            "Genre 1": "Drama",
            "Genre 2": "Romance",
            "Genre 3": "Thriller"
        },
        "163": {
            "Name": "Torn Curtain",
            "Number": 293,
            "Year": "1966",
            "Actor": "Ludwig Donath",
            "Role": "Professor Gustav Lindt",
            "Rating": 55,
            "Genre 1": "Drama",
            "Genre 2": "Romance",
            "Genre 3": "Thriller"
        },
        "164": {
            "Name": "Torn Curtain",
            "Number": 293,
            "Year": "1966",
            "Actor": "G\u00fcnter Strack",
            "Role": "Professor Karl Manfred",
            "Rating": 55,
            "Genre 1": "Drama",
            "Genre 2": "Romance",
            "Genre 3": "Thriller"
        },
        "165": {
            "Name": "Gojira",
            "Number": 299,
            "Year": "1954",
            "Actor": "Fuyuki Murakami",
            "Role": "Professor Tanabe",
            "Rating": 78,
            "Genre 1": "Action",
            "Genre 2": "Horror",
            "Genre 3": "Sci-Fi",
            "Genre 4": "Thriller"
        },
        "166": {
            "Name": "Gojira",
            "Number": 299,
            "Year": "1954",
            "Actor": "Tadashi Okabe",
            "Role": "Prof. Tanabe's Assistant",
            "Rating": 78,
            "Genre 1": "Action",
            "Genre 2": "Horror",
            "Genre 3": "Sci-Fi",
            "Genre 4": "Thriller"
        },
        "167": {
            "Name": "Liberal Arts",
            "Number": 300,
            "Year": "2012",
            "Actor": "Richard Jenkins",
            "Role": "Professor Peter Hoberg",
            "Rating": 55,
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "168": {
            "Name": "Liberal Arts",
            "Number": 300,
            "Year": "2012",
            "Actor": "Allison Janney",
            "Role": "Professor Judith Fairfield",
            "Rating": 55,
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "169": {
            "Name": "The Best of Youth",
            "Number": 301,
            "Year": "2003",
            "Actor": "Mario Schiano",
            "Role": "Professore di Medicina",
            "Rating": 89,
            "Genre 1": "Drama",
            "Genre 2": "Romance"
        },
        "170": {
            "Name": "The Best of Youth",
            "Number": 301,
            "Year": "2003",
            "Actor": "Michele Melega",
            "Role": "Professore di Lettere",
            "Rating": 89,
            "Genre 1": "Drama",
            "Genre 2": "Romance"
        },
        "171": {
            "Name": "The Nutty Professor",
            "Number": 303,
            "Year": "1963",
            "Actor": "Jerry Lewis",
            "Role": "Prof. Julius Kelp",
            "Rating": "56",
            "Genre 1": "Comedy",
            "Genre 2": "Romance",
            "Genre 3": "Sci-Fi"
        },
        "172": {
            "Name": "Ball of Fire",
            "Number": 304,
            "Year": "1941",
            "Actor": "Gary Cooper",
            "Role": "Prof. Bertram Potts",
            "Rating": 78,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "173": {
            "Name": "Ball of Fire",
            "Number": 304,
            "Year": "1941",
            "Actor": "Oskar Homolka",
            "Role": "Prof. Gurkakoff",
            "Rating": 78,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "174": {
            "Name": "Ball of Fire",
            "Number": 304,
            "Year": "1941",
            "Actor": "Henry Travers",
            "Role": "Prof. Jerome",
            "Rating": 78,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "175": {
            "Name": "Ball of Fire",
            "Number": 304,
            "Year": "1941",
            "Actor": "S.Z. Sakall",
            "Role": "Prof. Magenbruch",
            "Rating": 78,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "176": {
            "Name": "Ball of Fire",
            "Number": 304,
            "Year": "1941",
            "Actor": "Tully Marshall",
            "Role": "Prof. Robinson",
            "Rating": 78,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "177": {
            "Name": "Ball of Fire",
            "Number": 304,
            "Year": "1941",
            "Actor": "Leonid Kinskey",
            "Role": "Prof. Quintana",
            "Rating": 78,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "178": {
            "Name": "Ball of Fire",
            "Number": 304,
            "Year": "1941",
            "Actor": "Richard Haydn",
            "Role": "Prof. Oddly",
            "Rating": 78,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "179": {
            "Name": "Ball of Fire",
            "Number": 304,
            "Year": "1941",
            "Actor": "Aubrey Mather",
            "Role": "Prof. Peagram",
            "Rating": 78,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "180": {
            "Name": "Empire of the Wolves",
            "Number": 305,
            "Year": "2005",
            "Actor": "Jean-Pierre Martins",
            "Role": "Professeur Ravi",
            "Rating": "37",
            "Genre 1": "Action",
            "Genre 2": "Crime",
            "Genre 3": "Drama",
            "Genre 4": "Mystery"
        },
        "181": {
            "Name": "The Sisterhood of the Traveling Pants 2",
            "Number": 308,
            "Year": "2008",
            "Actor": "Shohreh Aghdashloo",
            "Role": "Professor Nasrin Mehani",
            "Rating": 63,
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "182": {
            "Name": "Possession",
            "Number": 309,
            "Year": "2002",
            "Actor": "Roger Hammond",
            "Role": "Professor Spear",
            "Rating": 52,
            "Genre 1": "Drama",
            "Genre 2": "Mystery",
            "Genre 3": "Romance"
        },
        "183": {
            "Name": "Make the Yuletide Gay",
            "Number": 310,
            "Year": "2009",
            "Actor": "Steve Callahan",
            "Role": "Professor Daniel Van Devere",
            "Rating": "13",
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "184": {
            "Name": "Tesis",
            "Number": 314,
            "Year": "1996",
            "Actor": "Jos\u00e9 Luis Cuerda",
            "Role": "Profesor 1\u00ba",
            "Rating": "68",
            "Genre 1": "Horror",
            "Genre 2": "Mystery",
            "Genre 3": "Thriller"
        },
        "185": {
            "Name": "Tesis",
            "Number": 314,
            "Year": "1996",
            "Actor": "Emiliano Otegui",
            "Role": "Profesor 2\u00ba",
            "Rating": "68",
            "Genre 1": "Horror",
            "Genre 2": "Mystery",
            "Genre 3": "Thriller"
        },
        "186": {
            "Name": "Alone in the Dark",
            "Number": 318,
            "Year": "2005",
            "Actor": "Matthew Walker",
            "Role": "Prof. Lionel Hudgens",
            "Rating": 9,
            "Genre 1": "Action",
            "Genre 2": "Horror",
            "Genre 3": "Sci-Fi"
        },
        "187": {
            "Name": "The Stranger",
            "Number": 319,
            "Year": "1946",
            "Actor": "Orson Welles",
            "Role": "Professor Charles Rankin",
            "Rating": 76,
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Film-Noir",
            "Genre 4": "Mystery"
        },
        "188": {
            "Name": "The Woman in the Window",
            "Number": 323,
            "Year": "1944",
            "Actor": "Edward G. Robinson",
            "Role": "Prof. Richard Wanley",
            "Rating": "76",
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Film-Noir",
            "Genre 4": "Mystery"
        },
        "189": {
            "Name": "Pulse",
            "Number": 325,
            "Year": "2006",
            "Actor": "Zach Grenier",
            "Role": "Professor Cardiff",
            "Rating": 27,
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Thriller"
        },
        "190": {
            "Name": "Teen Wolf Too",
            "Number": 331,
            "Year": "1987",
            "Actor": "Kim Darby",
            "Role": "Professor Brooks",
            "Rating": 8,
            "Genre 1": "Comedy",
            "Genre 2": "Fantasy"
        },
        "191": {
            "Name": "Teen Wolf Too",
            "Number": 331,
            "Year": "1987",
            "Actor": "Lawrence Parks",
            "Role": "Professor Capps",
            "Rating": 8,
            "Genre 1": "Comedy",
            "Genre 2": "Fantasy"
        },
        "192": {
            "Name": "Ninja",
            "Number": 332,
            "Year": "2009",
            "Actor": "Garrick Hagon",
            "Role": "Professor Garrison",
            "Rating": "84",
            "Genre 1": "Action",
            "Genre 2": "Thriller"
        },
        "193": {
            "Name": "Der blaue Engel",
            "Number": 335,
            "Year": "1930",
            "Actor": "Emil Jannings",
            "Role": "Professor Immanuel Rath",
            "Rating": 88,
            "Genre 1": "Drama",
            "Genre 2": "Music"
        },
        "194": {
            "Name": "The Curse of Frankenstein",
            "Number": 336,
            "Year": "1957",
            "Actor": "Paul Hardtmuth",
            "Role": "Prof. Bernstein",
            "Rating": 59,
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Thriller"
        },
        "195": {
            "Name": "Village of the Damned",
            "Number": 345,
            "Year": "1960",
            "Actor": "John Stuart",
            "Role": "Professor Smith",
            "Rating": 77,
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi"
        },
        "196": {
            "Name": "The Quiet Ones",
            "Number": 347,
            "Year": "2014",
            "Actor": "Jared Harris",
            "Role": "Professor Joseph Coupland",
            "Rating": 41,
            "Genre 1": "Horror",
            "Genre 2": "Mystery",
            "Genre 3": "Thriller"
        },
        "197": {
            "Name": "Tea with Mussolini",
            "Number": 350,
            "Year": "1999",
            "Actor": "Ferdinando Ferrini",
            "Role": "Professor Cassuto",
            "Rating": 53,
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "War"
        },
        "198": {
            "Name": "A Haunted House 2",
            "Number": 355,
            "Year": "2014",
            "Actor": "Rick Overton",
            "Role": "Professor Wilde",
            "Rating": 17,
            "Genre 1": "Comedy",
            "Genre 2": "Fantasy"
        },
        "199": {
            "Name": "18 Again!",
            "Number": 356,
            "Year": "1988",
            "Actor": "Kenneth Tigar",
            "Role": "Professor Swivet",
            "Rating": "10",
            "Genre 1": "Comedy",
            "Genre 2": "Fantasy",
            "Genre 3": "Romance"
        },
        "200": {
            "Name": "Cherry",
            "Number": 357,
            "Year": "2010",
            "Actor": "Matt Walsh",
            "Role": "Prof. Van Auken",
            "Rating": "13",
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "201": {
            "Name": "Cherry",
            "Number": 357,
            "Year": "2010",
            "Actor": "John Judd",
            "Role": "Prof. Krause",
            "Rating": "13",
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "202": {
            "Name": "I'll Follow You Down",
            "Number": 361,
            "Year": "2013",
            "Actor": "Thomas Hauff",
            "Role": "Professor",
            "Rating": "39",
            "Genre 1": "Drama",
            "Genre 2": "Mystery",
            "Genre 3": "Sci-Fi"
        },
        "203": {
            "Name": "Songs from the Second Floor",
            "Number": 364,
            "Year": "2000",
            "Actor": "Erik Olsausson",
            "Role": "Prof. Frank",
            "Rating": 77,
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "204": {
            "Name": "Indignation",
            "Number": 366,
            "Year": "2016",
            "Actor": "Robert Verlaque",
            "Role": "Professor Sundquist",
            "Rating": 78,
            "Genre 1": "Drama",
            "Genre 2": "Romance"
        },
        "205": {
            "Name": "The Fourth Protocol",
            "Number": 369,
            "Year": "1987",
            "Actor": "Jerry Harte",
            "Role": "Professor Krilov",
            "Rating": 64,
            "Genre 1": "Thriller"
        },
        "206": {
            "Name": "L'insegnante",
            "Number": 376,
            "Year": "1975",
            "Actor": "Carlo Delle Piane",
            "Role": "Professor Cali",
            "Rating": "7",
            "Genre 1": "Comedy"
        },
        "207": {
            "Name": "L'insegnante",
            "Number": 376,
            "Year": "1975",
            "Actor": "Gianfranco D'Angelo",
            "Role": "Professor Puntiglio",
            "Rating": "7",
            "Genre 1": "Comedy"
        },
        "208": {
            "Name": "Last of the Dogmen",
            "Number": 384,
            "Year": "1995",
            "Actor": "Barbara Hershey",
            "Role": "Prof. Lillian Diane Sloan",
            "Rating": "16",
            "Genre 1": "Adventure",
            "Genre 2": "Western"
        },
        "209": {
            "Name": "So Fine",
            "Number": 385,
            "Year": "1981",
            "Actor": "David Rounds",
            "Role": "Prof. McCarthy",
            "Rating": 48,
            "Genre 1": "Comedy"
        },
        "210": {
            "Name": "So Fine",
            "Number": 385,
            "Year": "1981",
            "Actor": "Joel Stedman",
            "Role": "Prof. Yarnell",
            "Rating": 48,
            "Genre 1": "Comedy"
        },
        "211": {
            "Name": "So Fine",
            "Number": 385,
            "Year": "1981",
            "Actor": "Alma Cuervo",
            "Role": "Prof. Adler",
            "Rating": 48,
            "Genre 1": "Comedy"
        },
        "212": {
            "Name": "The Absent Minded Professor",
            "Number": 386,
            "Year": "1961",
            "Actor": "Fred MacMurray",
            "Role": "Professor Ned Brainard",
            "Rating": 75,
            "Genre 1": "Comedy",
            "Genre 2": "Family",
            "Genre 3": "Sci-Fi",
            "Genre 4": "Sport"
        },
        "213": {
            "Name": "The Absent Minded Professor",
            "Number": 386,
            "Year": "1961",
            "Actor": "Elliott Reid",
            "Role": "Professor Shelby Ashton",
            "Rating": 75,
            "Genre 1": "Comedy",
            "Genre 2": "Family",
            "Genre 3": "Sci-Fi",
            "Genre 4": "Sport"
        },
        "214": {
            "Name": "Youth Without Youth",
            "Number": 388,
            "Year": "2007",
            "Actor": "Bruno Ganz",
            "Role": "Prof. Roman Stanciulescu",
            "Rating": 43,
            "Genre 1": "Drama",
            "Genre 2": "Fantasy",
            "Genre 3": "Mystery",
            "Genre 4": "Romance"
        },
        "215": {
            "Name": "Youth Without Youth",
            "Number": 388,
            "Year": "2007",
            "Actor": "Marcel Iures",
            "Role": "Prof. Giuseppe Tucci",
            "Rating": 43,
            "Genre 1": "Drama",
            "Genre 2": "Fantasy",
            "Genre 3": "Mystery",
            "Genre 4": "Romance"
        },
        "216": {
            "Name": "The Thaw",
            "Number": 397,
            "Year": "2009",
            "Actor": "Evan Adams",
            "Role": "Professor Anderson",
            "Rating": "45",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi"
        },
        "217": {
            "Name": "Arabesque",
            "Number": 401,
            "Year": "1966",
            "Actor": "Gregory Peck",
            "Role": "Prof. David Pollock",
            "Rating": 69,
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Crime",
            "Genre 4": "Drama"
        },
        "218": {
            "Name": "Gossip",
            "Number": 404,
            "Year": "2000",
            "Actor": "Eric Bogosian",
            "Role": "Professor Goodwin",
            "Rating": 31,
            "Genre 1": "Drama",
            "Genre 2": "Mystery",
            "Genre 3": "Thriller"
        },
        "219": {
            "Name": "Gossip",
            "Number": 404,
            "Year": "2000",
            "Actor": "David Nichols",
            "Role": "Professor Vindaloo",
            "Rating": 31,
            "Genre 1": "Drama",
            "Genre 2": "Mystery",
            "Genre 3": "Thriller"
        },
        "220": {
            "Name": "Ted Bundy",
            "Number": 405,
            "Year": "2002",
            "Actor": "Julianna McCarthy",
            "Role": "Professor",
            "Rating": 37,
            "Genre 1": "Biography",
            "Genre 2": "Crime",
            "Genre 3": "Drama",
            "Genre 4": "Horror"
        },
        "221": {
            "Name": "Flood",
            "Number": 406,
            "Year": "2007",
            "Actor": "Tom Courtenay",
            "Role": "Prof. Leonard Morrison",
            "Rating": "12",
            "Genre 1": "Action",
            "Genre 2": "Drama",
            "Genre 3": "Thriller"
        },
        "222": {
            "Name": "I.Q.",
            "Number": 408,
            "Year": "1994",
            "Actor": "Sol Frieder",
            "Role": "Professor Loewenstein",
            "Rating": 66,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "223": {
            "Name": "Control",
            "Number": 409,
            "Year": "2003",
            "Actor": "Zolt\u00e1n Mucsi",
            "Role": "Professor",
            "Rating": 72,
            "Genre 1": "Comedy",
            "Genre 2": "Crime",
            "Genre 3": "Drama",
            "Genre 4": "Romance"
        },
        "224": {
            "Name": "Day of Resurrection",
            "Number": 414,
            "Year": "1980",
            "Actor": "Ken Ogata",
            "Role": "Prof. Tsuchiya",
            "Rating": "38",
            "Genre 1": "Adventure",
            "Genre 2": "Drama",
            "Genre 3": "Horror",
            "Genre 4": "Sci-Fi"
        },
        "225": {
            "Name": "Enduring Love",
            "Number": 418,
            "Year": "2004",
            "Actor": "Corin Redgrave",
            "Role": "Professor",
            "Rating": 61,
            "Genre 1": "Drama",
            "Genre 2": "Mystery",
            "Genre 3": "Romance",
            "Genre 4": "Thriller"
        },
        "226": {
            "Name": "Woman in the Moon",
            "Number": 422,
            "Year": "1929",
            "Actor": "Klaus Pohl",
            "Role": "Professor Georg Manfeldt",
            "Rating": "35",
            "Genre 1": "Adventure",
            "Genre 2": "Comedy",
            "Genre 3": "Drama",
            "Genre 4": "Romance"
        },
        "227": {
            "Name": "A Fish Tale",
            "Number": 424,
            "Year": "2000",
            "Actor": "S\u00f8ren S\u00e6tter-Lassen",
            "Role": "Professor Mac Krill",
            "Rating": "29",
            "Genre 1": "Animation",
            "Genre 2": "Adventure",
            "Genre 3": "Comedy",
            "Genre 4": "Drama"
        },
        "228": {
            "Name": "Smilla's Sense of Snow",
            "Number": 426,
            "Year": "1997",
            "Actor": "Tom Wilkinson",
            "Role": "Prof. Loyen",
            "Rating": 45,
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Mystery",
            "Genre 4": "Sci-Fi"
        },
        "229": {
            "Name": "Avenging Force",
            "Number": 429,
            "Year": "1986",
            "Actor": "John P. Ryan",
            "Role": "Prof. Elliott Glastenbury",
            "Rating": "31",
            "Genre 1": "Action",
            "Genre 2": "Drama",
            "Genre 3": "Thriller"
        },
        "230": {
            "Name": "The Enigma of Kaspar Hauser",
            "Number": 435,
            "Year": "1974",
            "Actor": "Walter Ladengast",
            "Role": "Professor Daumer",
            "Rating": "48",
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "History"
        },
        "231": {
            "Name": "The Mortal Storm",
            "Number": 437,
            "Year": "1940",
            "Actor": "Frank Morgan",
            "Role": "Professor Viktor Roth",
            "Rating": "32",
            "Genre 1": "Drama"
        },
        "232": {
            "Name": "The Mortal Storm",
            "Number": 437,
            "Year": "1940",
            "Actor": "Granville Bates",
            "Role": "Professor Berg",
            "Rating": "32",
            "Genre 1": "Drama"
        },
        "233": {
            "Name": "The Mortal Storm",
            "Number": 437,
            "Year": "1940",
            "Actor": "Thomas W. Ross",
            "Role": "Professor Werner",
            "Rating": "32",
            "Genre 1": "Drama"
        },
        "234": {
            "Name": "Hannah Arendt",
            "Number": 438,
            "Year": "2012",
            "Actor": "Gilbert Johnston",
            "Role": "Professor Kahn",
            "Rating": 69,
            "Genre 1": "Biography",
            "Genre 2": "Drama"
        },
        "235": {
            "Name": "Hannah Arendt",
            "Number": 438,
            "Year": "2012",
            "Actor": "Alexander Tschernek",
            "Role": "Professor",
            "Rating": 69,
            "Genre 1": "Biography",
            "Genre 2": "Drama"
        },
        "236": {
            "Name": "She Killed in Ecstasy",
            "Number": 443,
            "Year": "1971",
            "Actor": "Howard Vernon",
            "Role": "Prof. Jonathan Walker",
            "Rating": "65",
            "Genre 1": "Horror"
        },
        "237": {
            "Name": "The Lost World",
            "Number": 444,
            "Year": "1960",
            "Actor": "Claude Rains",
            "Role": "Prof. George Edward Challenger",
            "Rating": "48",
            "Genre 1": "Adventure",
            "Genre 2": "Fantasy",
            "Genre 3": "Sci-Fi"
        },
        "238": {
            "Name": "The Lost World",
            "Number": 444,
            "Year": "1960",
            "Actor": "Richard Haydn",
            "Role": "Prof. Summerlee",
            "Rating": "48",
            "Genre 1": "Adventure",
            "Genre 2": "Fantasy",
            "Genre 3": "Sci-Fi"
        },
        "239": {
            "Name": "Flash of Genius",
            "Number": 445,
            "Year": "2008",
            "Actor": "Chuck Shamata",
            "Role": "Professor Irwin",
            "Rating": 57,
            "Genre 1": "Biography",
            "Genre 2": "Drama"
        },
        "240": {
            "Name": "People Will Talk",
            "Number": 446,
            "Year": "1951",
            "Actor": "Hume Cronyn",
            "Role": "Prof. Rodney Elwell",
            "Rating": "26",
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "241": {
            "Name": "People Will Talk",
            "Number": 446,
            "Year": "1951",
            "Actor": "Walter Slezak",
            "Role": "Prof. Barker",
            "Rating": "26",
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "242": {
            "Name": "Flower Drum Song",
            "Number": 448,
            "Year": "1961",
            "Actor": "Ching Wah Lee",
            "Role": "Professor",
            "Rating": "10",
            "Genre 1": "Comedy",
            "Genre 2": "Musical",
            "Genre 3": "Romance"
        },
        "243": {
            "Name": "Terror by Night",
            "Number": 449,
            "Year": "1946",
            "Actor": "Frederick Worlock",
            "Role": "Prof. William Kilbane",
            "Rating": "30",
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Film-Noir",
            "Genre 4": "Mystery"
        },
        "244": {
            "Name": "Five Dolls for an August Moon",
            "Number": 454,
            "Year": "1970",
            "Actor": "William Berger",
            "Role": "Professore Fritz Farrell",
            "Rating": "60",
            "Genre 1": "Horror",
            "Genre 2": "Mystery",
            "Genre 3": "Thriller"
        },
        "245": {
            "Name": "Tammy and the Bachelor",
            "Number": 455,
            "Year": "1957",
            "Actor": "Sidney Blackmer",
            "Role": "Professor Brent",
            "Rating": "14",
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "246": {
            "Name": "First Men in the Moon",
            "Number": 457,
            "Year": "1964",
            "Actor": "Lionel Jeffries",
            "Role": "Prof. Joseph Cavor",
            "Rating": "72",
            "Genre 1": "Adventure",
            "Genre 2": "Sci-Fi"
        },
        "247": {
            "Name": "Tall Story",
            "Number": 459,
            "Year": "1960",
            "Actor": "Ray Walston",
            "Role": "Prof. Leo Sullivan",
            "Rating": "9",
            "Genre 1": "Comedy",
            "Genre 2": "Sport"
        },
        "248": {
            "Name": "Tall Story",
            "Number": 459,
            "Year": "1960",
            "Actor": "Marc Connelly",
            "Role": "Prof. Charles Osman",
            "Rating": "9",
            "Genre 1": "Comedy",
            "Genre 2": "Sport"
        },
        "249": {
            "Name": "Antonia's Line",
            "Number": 461,
            "Year": "1995",
            "Actor": "Hans Man in 't Veld",
            "Role": "Professor",
            "Rating": "52",
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "250": {
            "Name": "The Landlord",
            "Number": 467,
            "Year": "1970",
            "Actor": "Mel Stewart",
            "Role": "Professor Duboise",
            "Rating": 75,
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "251": {
            "Name": "Pok\u00e9mon 3 the Movie: Spell of the Unown",
            "Number": 468,
            "Year": "2000",
            "Actor": "Dan Green",
            "Role": "Professor Spencer Hale",
            "Rating": "43",
            "Genre 1": "Animation",
            "Genre 2": "Action",
            "Genre 3": "Adventure",
            "Genre 4": "Family"
        },
        "252": {
            "Name": "Pok\u00e9mon 3 the Movie: Spell of the Unown",
            "Number": 468,
            "Year": "2000",
            "Actor": "Stuart Zagnit",
            "Role": "Professor Oak",
            "Rating": "43",
            "Genre 1": "Animation",
            "Genre 2": "Action",
            "Genre 3": "Adventure",
            "Genre 4": "Family"
        },
        "253": {
            "Name": "Day of the Animals",
            "Number": 469,
            "Year": "1977",
            "Actor": "Richard Jaeckel",
            "Role": "Professor MacGregor",
            "Rating": "68",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Thriller"
        },
        "254": {
            "Name": "Aligarh",
            "Number": 474,
            "Year": "2015",
            "Actor": "Manoj Bajpayee",
            "Role": "Professor Ramchandra Siras",
            "Rating": "34",
            "Genre 1": "Biography",
            "Genre 2": "Drama"
        },
        "255": {
            "Name": "Aligarh",
            "Number": 474,
            "Year": "2015",
            "Actor": "K.R. Parmeshwar",
            "Role": "Prof. Sridharan",
            "Rating": "34",
            "Genre 1": "Biography",
            "Genre 2": "Drama"
        },
        "256": {
            "Name": "M\u00e2dadayo",
            "Number": 478,
            "Year": "1993",
            "Actor": "Tatsuo Matsumura",
            "Role": "Professor Hyakken Uchida",
            "Rating": 76,
            "Genre 1": "Drama"
        },
        "257": {
            "Name": "M\u00e2dadayo",
            "Number": 478,
            "Year": "1993",
            "Actor": "Ky\u00f4ko Kagawa",
            "Role": "Professor's Wife",
            "Rating": 76,
            "Genre 1": "Drama"
        },
        "258": {
            "Name": "A Murder of Crows",
            "Number": 482,
            "Year": "1998",
            "Actor": "Mark Pellegrino",
            "Role": "Prof. Arthur Corvus",
            "Rating": "19",
            "Genre 1": "Action",
            "Genre 2": "Crime",
            "Genre 3": "Thriller"
        },
        "259": {
            "Name": "Raintree County",
            "Number": 485,
            "Year": "1957",
            "Actor": "Nigel Patrick",
            "Role": "Professor Jerusalem Webster Stiles",
            "Rating": "16",
            "Genre 1": "Drama",
            "Genre 2": "Romance",
            "Genre 3": "War",
            "Genre 4": "Western"
        },
        "260": {
            "Name": "The Island at the Top of the World",
            "Number": 486,
            "Year": "1974",
            "Actor": "David Hartman",
            "Role": "Prof. Ivarsson",
            "Rating": "23",
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Fantasy",
            "Genre 4": "Sci-Fi"
        },
        "261": {
            "Name": "Teach Me Tonight",
            "Number": 489,
            "Year": "1997",
            "Actor": "John Logan",
            "Role": "Prof. Sterling Manville",
            "Rating": "2",
            "Genre 1": "Mystery",
            "Genre 2": "Romance",
            "Genre 3": "Thriller"
        },
        "262": {
            "Name": "Lucky Jim",
            "Number": 495,
            "Year": "1957",
            "Actor": "Hugh Griffith",
            "Role": "Professor Welch",
            "Rating": "4",
            "Genre 1": "Comedy"
        },
        "263": {
            "Name": "Lucky Jim",
            "Number": 495,
            "Year": "1957",
            "Actor": "Henry B. Longhurst",
            "Role": "Professor Hutchinson",
            "Rating": "4",
            "Genre 1": "Comedy"
        },
        "264": {
            "Name": "Anatomy",
            "Number": 501,
            "Year": "2000",
            "Actor": "Traugott Buhre",
            "Role": "Prof. Grombek",
            "Rating": 33,
            "Genre 1": "Horror",
            "Genre 2": "Thriller"
        },
        "265": {
            "Name": "Anatomy",
            "Number": 501,
            "Year": "2000",
            "Actor": "Thomas Meinhardt",
            "Role": "Professor in M\u00fcnchen",
            "Rating": 33,
            "Genre 1": "Horror",
            "Genre 2": "Thriller"
        },
        "266": {
            "Name": "The Testament of Dr. Mabuse",
            "Number": 504,
            "Year": "1933",
            "Actor": "Thomy Bourdelle",
            "Role": "Professeur Baum",
            "Rating": "88",
            "Genre 1": "Crime",
            "Genre 2": "Horror",
            "Genre 3": "Mystery",
            "Genre 4": "Thriller"
        },
        "267": {
            "Name": "Son of Flubber",
            "Number": 506,
            "Year": "1963",
            "Actor": "Fred MacMurray",
            "Role": "Prof. Ned Brainard",
            "Rating": "13",
            "Genre 1": "Comedy",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Family"
        },
        "268": {
            "Name": "Son of Flubber",
            "Number": 506,
            "Year": "1963",
            "Actor": "Elliott Reid",
            "Role": "Prof. Shelby Ashton",
            "Rating": "13",
            "Genre 1": "Comedy",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Family"
        },
        "269": {
            "Name": "Rivelazioni di un maniaco sessuale al capo della squadra mobile",
            "Number": 507,
            "Year": "1972",
            "Actor": "Chris Avram",
            "Role": "Professor Casali",
            "Rating": "32",
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Mystery",
            "Genre 4": "Thriller"
        },
        "270": {
            "Name": "Katyn",
            "Number": 509,
            "Year": "2007",
            "Actor": "Wladyslaw Kowalski",
            "Role": "Professor Jan",
            "Rating": 81,
            "Genre 1": "Drama",
            "Genre 2": "History",
            "Genre 3": "War"
        },
        "271": {
            "Name": "Katyn",
            "Number": 509,
            "Year": "2007",
            "Actor": "Krzysztof Globisz",
            "Role": "Professor of Forensic Medicine",
            "Rating": 81,
            "Genre 1": "Drama",
            "Genre 2": "History",
            "Genre 3": "War"
        },
        "272": {
            "Name": "The Valley of Gwangi",
            "Number": 511,
            "Year": "1969",
            "Actor": "Laurence Naismith",
            "Role": "Professor Bromley",
            "Rating": "45",
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Sci-Fi",
            "Genre 4": "Thriller"
        },
        "273": {
            "Name": "Horse Feathers",
            "Number": 512,
            "Year": "1932",
            "Actor": "Groucho Marx",
            "Role": "Professor Quincy Adams Wagstaff",
            "Rating": 83,
            "Genre 1": "Comedy",
            "Genre 2": "Musical",
            "Genre 3": "Romance",
            "Genre 4": "Sport"
        },
        "274": {
            "Name": "Godzilla vs. King Ghidorah",
            "Number": 513,
            "Year": "1991",
            "Actor": "Katsuhiko Sasaki",
            "Role": "Professor Mazaki",
            "Rating": "56",
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Drama",
            "Genre 4": "Sci-Fi"
        },
        "275": {
            "Name": "It Came from Beneath the Sea",
            "Number": 517,
            "Year": "1955",
            "Actor": "Faith Domergue",
            "Role": "Prof. Lesley Joyce",
            "Rating": "76",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi"
        },
        "276": {
            "Name": "Nostradamus",
            "Number": 523,
            "Year": "1994",
            "Actor": "Bruce Myers",
            "Role": "Professor",
            "Rating": "10",
            "Genre 1": "Biography",
            "Genre 2": "Drama"
        },
        "277": {
            "Name": "Hands of Steel",
            "Number": 525,
            "Year": "1986",
            "Actor": "Donald O'Brien",
            "Role": "Prof. Olster",
            "Rating": "53",
            "Genre 1": "Action",
            "Genre 2": "Sci-Fi"
        },
        "278": {
            "Name": "La corta notte delle bambole di vetro",
            "Number": 528,
            "Year": "1971",
            "Actor": "Fabijan Sovagovic",
            "Role": "Professor Karting",
            "Rating": "62",
            "Genre 1": "Horror",
            "Genre 2": "Mystery"
        },
        "279": {
            "Name": "Our Town",
            "Number": 531,
            "Year": "1940",
            "Actor": "Arthur B. Allen",
            "Role": "Professor Willard",
            "Rating": "13",
            "Genre 1": "Drama",
            "Genre 2": "Romance"
        },
        "280": {
            "Name": "My Best Friend Is a Vampire",
            "Number": 532,
            "Year": "1987",
            "Actor": "David Warner",
            "Role": "Professor Leopold McCarthy",
            "Rating": "18",
            "Genre 1": "Comedy",
            "Genre 2": "Horror",
            "Genre 3": "Romance"
        },
        "281": {
            "Name": "Munchie",
            "Number": 534,
            "Year": "1992",
            "Actor": "Arte Johnson",
            "Role": "Prof. Cruikshank",
            "Rating": "16",
            "Genre 1": "Comedy",
            "Genre 2": "Family",
            "Genre 3": "Fantasy"
        },
        "282": {
            "Name": "Strange Invaders",
            "Number": 535,
            "Year": "1983",
            "Actor": "Charles Lane",
            "Role": "Professor Hollister",
            "Rating": "54",
            "Genre 1": "Horror",
            "Genre 2": "Mystery",
            "Genre 3": "Sci-Fi"
        },
        "283": {
            "Name": "Creator",
            "Number": 541,
            "Year": "1985",
            "Actor": "Ian Wolfe",
            "Role": "Prof. Brauer",
            "Rating": "17",
            "Genre 1": "Comedy",
            "Genre 2": "Romance",
            "Genre 3": "Sci-Fi"
        },
        "284": {
            "Name": "Godzilla vs. Mechagodzilla",
            "Number": 543,
            "Year": "1974",
            "Actor": "Akihiko Hirata",
            "Role": "Professor Hideto Miyajima",
            "Rating": "50",
            "Genre 1": "Action",
            "Genre 2": "Fantasy",
            "Genre 3": "Horror",
            "Genre 4": "Sci-Fi"
        },
        "285": {
            "Name": "Godzilla vs. Mechagodzilla",
            "Number": 543,
            "Year": "1974",
            "Actor": "Hiroshi Koizumi",
            "Role": "Professor Wagura",
            "Rating": "50",
            "Genre 1": "Action",
            "Genre 2": "Fantasy",
            "Genre 3": "Horror",
            "Genre 4": "Sci-Fi"
        },
        "286": {
            "Name": "404: Error Not Found",
            "Number": 544,
            "Year": "2011",
            "Actor": "Sara Arjun",
            "Role": "Prof. Aniruddh's daughter",
            "Rating": "7",
            "Genre 1": "Drama",
            "Genre 2": "Mystery",
            "Genre 3": "Thriller"
        },
        "287": {
            "Name": "The Garden of the Finzi-Continis",
            "Number": 545,
            "Year": "1970",
            "Actor": "Camillo Cesarei",
            "Role": "Prof. Ermanno Finzi Contini",
            "Rating": "43",
            "Genre 1": "Drama",
            "Genre 2": "History",
            "Genre 3": "War"
        },
        "288": {
            "Name": "The Garden of the Finzi-Continis",
            "Number": 545,
            "Year": "1970",
            "Actor": "Camillo Angelini-Rota",
            "Role": "Prof. Ermanno Finzi-Contini",
            "Rating": "43",
            "Genre 1": "Drama",
            "Genre 2": "History",
            "Genre 3": "War"
        },
        "289": {
            "Name": "Reptilicus",
            "Number": 548,
            "Year": "1961",
            "Actor": "Asbj\u00f8rn Andersen",
            "Role": "Prof. Otto Martens",
            "Rating": "58",
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Drama",
            "Genre 4": "Fantasy"
        },
        "290": {
            "Name": "Godzilla vs. Destoroyah",
            "Number": 551,
            "Year": "1995",
            "Actor": "Sabur\u00f4 Shinoda",
            "Role": "Professor Fukazawa",
            "Rating": "50",
            "Genre 1": "Action",
            "Genre 2": "Horror",
            "Genre 3": "Sci-Fi"
        },
        "291": {
            "Name": "Godzilla vs. Destoroyah",
            "Number": 551,
            "Year": "1995",
            "Actor": "Ronald Hoerr",
            "Role": "Professor Marvin",
            "Rating": "50",
            "Genre 1": "Action",
            "Genre 2": "Horror",
            "Genre 3": "Sci-Fi"
        },
        "292": {
            "Name": "Prisoners of the Sun",
            "Number": 553,
            "Year": "2013",
            "Actor": "John Rhys-Davies",
            "Role": "Prof. Hayden Masterton",
            "Rating": "8",
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Horror",
            "Genre 4": "Mystery"
        },
        "293": {
            "Name": "Prisoners of the Sun",
            "Number": 553,
            "Year": "2013",
            "Actor": "Joss Ackland",
            "Role": "Prof. Mendella",
            "Rating": "8",
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Horror",
            "Genre 4": "Mystery"
        },
        "294": {
            "Name": "Prisoners of the Sun",
            "Number": 553,
            "Year": "2013",
            "Actor": "Mohamed Akhzam",
            "Role": "Prof. Hayden Masterton Right hand",
            "Rating": "8",
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Horror",
            "Genre 4": "Mystery"
        },
        "295": {
            "Name": "Insignificance",
            "Number": 555,
            "Year": "1985",
            "Actor": "Michael Emil",
            "Role": "Professor",
            "Rating": "30",
            "Genre 1": "Comedy"
        },
        "296": {
            "Name": "The Lost World",
            "Number": 556,
            "Year": "1925",
            "Actor": "Wallace Beery",
            "Role": "Prof. Challenger",
            "Rating": "64",
            "Genre 1": "Adventure",
            "Genre 2": "Fantasy",
            "Genre 3": "Sci-Fi",
            "Genre 4": "Thriller"
        },
        "297": {
            "Name": "The Lost World",
            "Number": 556,
            "Year": "1925",
            "Actor": "Arthur Hoyt",
            "Role": "Prof. Summerlee",
            "Rating": "64",
            "Genre 1": "Adventure",
            "Genre 2": "Fantasy",
            "Genre 3": "Sci-Fi",
            "Genre 4": "Thriller"
        },
        "298": {
            "Name": "That Man from Rio",
            "Number": 560,
            "Year": "1964",
            "Actor": "Jean Servais",
            "Role": "Prof. Norbert Catalan",
            "Rating": "30",
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Comedy",
            "Genre 4": "Romance"
        },
        "299": {
            "Name": "The Legend of the 7 Golden Vampires",
            "Number": 564,
            "Year": "1974",
            "Actor": "Peter Cushing",
            "Role": "Professor Lawrence Van Helsing",
            "Rating": "91",
            "Genre 1": "Action",
            "Genre 2": "Horror"
        },
        "300": {
            "Name": "Dark Matter",
            "Number": 567,
            "Year": "2007",
            "Actor": "Joe Grifasi",
            "Role": "Professor Colby",
            "Rating": 49,
            "Genre 1": "Drama"
        },
        "301": {
            "Name": "Dark Matter",
            "Number": 567,
            "Year": "2007",
            "Actor": "Erick Avari",
            "Role": "Professor R.K. Gazda",
            "Rating": 49,
            "Genre 1": "Drama"
        },
        "302": {
            "Name": "Hush Hush",
            "Number": 571,
            "Year": "1975",
            "Actor": "Amitabh Bachchan",
            "Role": "Professor Sukumar Sinha",
            "Rating": "4",
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "303": {
            "Name": "Fiend Without a Face",
            "Number": 575,
            "Year": "1958",
            "Actor": "Kynaston Reeves",
            "Role": "Prof. R.E. Walgate",
            "Rating": "58",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi"
        },
        "304": {
            "Name": "Songcatcher",
            "Number": 576,
            "Year": "2000",
            "Actor": "Michael Goodwin",
            "Role": "Professor Wallace Aldrich",
            "Rating": 63,
            "Genre 1": "Drama",
            "Genre 2": "Music"
        },
        "305": {
            "Name": "Beach Party",
            "Number": 578,
            "Year": "1963",
            "Actor": "Robert Cummings",
            "Role": "Professor Sutwell",
            "Rating": "17",
            "Genre 1": "Comedy",
            "Genre 2": "Musical",
            "Genre 3": "Romance"
        },
        "306": {
            "Name": "The Million Dollar Duck",
            "Number": 579,
            "Year": "1971",
            "Actor": "Dean Jones",
            "Role": "Professor Albert Dooley",
            "Rating": 45,
            "Genre 1": "Comedy",
            "Genre 2": "Family",
            "Genre 3": "Sci-Fi"
        },
        "307": {
            "Name": "Monster in the Closet",
            "Number": 580,
            "Year": "1986",
            "Actor": "Denise DuBarry",
            "Role": "Prof. Diane Bennett",
            "Rating": "23",
            "Genre 1": "Comedy",
            "Genre 2": "Horror",
            "Genre 3": "Sci-Fi"
        },
        "308": {
            "Name": "Shark",
            "Number": 581,
            "Year": "1969",
            "Actor": "Barry Sullivan",
            "Role": "Prof. Dan Mallare",
            "Rating": "24",
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Thriller"
        },
        "309": {
            "Name": "Bickford Shmeckler's Cool Ideas",
            "Number": 583,
            "Year": "2006",
            "Actor": "Cheryl Hines",
            "Role": "Professor Adams",
            "Rating": "6",
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "310": {
            "Name": "A Time to Love and a Time to Die",
            "Number": 585,
            "Year": "1958",
            "Actor": "Erich Maria Remarque",
            "Role": "Professor Pohlmann",
            "Rating": "25",
            "Genre 1": "Drama",
            "Genre 2": "Romance",
            "Genre 3": "War"
        },
        "311": {
            "Name": "Dear Brigitte",
            "Number": 587,
            "Year": "1965",
            "Actor": "James Stewart",
            "Role": "Professor Robert Leaf",
            "Rating": "6",
            "Genre 1": "Comedy",
            "Genre 2": "Family"
        },
        "312": {
            "Name": "Endgame",
            "Number": 590,
            "Year": "2009",
            "Actor": "William Hurt",
            "Role": "Professor Willie Esterhuyse",
            "Rating": 55,
            "Genre 1": "Drama",
            "Genre 2": "History"
        },
        "313": {
            "Name": "Endgame",
            "Number": 590,
            "Year": "2009",
            "Actor": "David Henry",
            "Role": "Professor Marinus Wiechers",
            "Rating": 55,
            "Genre 1": "Drama",
            "Genre 2": "History"
        },
        "314": {
            "Name": "The Crimson Cult",
            "Number": 593,
            "Year": "1968",
            "Actor": "Boris Karloff",
            "Role": "Professor John Marsh",
            "Rating": "49",
            "Genre 1": "Horror"
        },
        "315": {
            "Name": "12:08 East of Bucharest",
            "Number": 595,
            "Year": "2006",
            "Actor": "Daniel Badale",
            "Role": "Professor",
            "Rating": 77,
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "316": {
            "Name": "Shablulim BaGeshem",
            "Number": 597,
            "Year": "2013",
            "Actor": "Yariv Mozer",
            "Role": "Prof. Richlin",
            "Rating": "19",
            "Genre 1": "Drama",
            "Genre 2": "Romance"
        },
        "317": {
            "Name": "The Coed and the Zombie Stoner",
            "Number": 601,
            "Year": "2014",
            "Actor": "Diane Chambers",
            "Role": "Professor Hagfish",
            "Rating": "13",
            "Genre 1": "Comedy",
            "Genre 2": "Horror",
            "Genre 3": "Sci-Fi"
        },
        "318": {
            "Name": "The Cutter",
            "Number": 602,
            "Year": "2005",
            "Actor": "Eli Danker",
            "Role": "Professor Abrams",
            "Rating": "20",
            "Genre 1": "Action",
            "Genre 2": "Crime",
            "Genre 3": "Drama",
            "Genre 4": "Thriller"
        },
        "319": {
            "Name": "Frat Party",
            "Number": 603,
            "Year": "2009",
            "Actor": "Erica Day",
            "Role": "Professor Beaubier",
            "Rating": "3",
            "Genre 1": "Comedy"
        },
        "320": {
            "Name": "Time Walker",
            "Number": 604,
            "Year": "1982",
            "Actor": "Ben Murphy",
            "Role": "Prof. Douglas McCadden",
            "Rating": "35",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi"
        },
        "321": {
            "Name": "Crypt of the Living Dead",
            "Number": 605,
            "Year": "1973",
            "Actor": "Mariano Garc\u00eda Rey",
            "Role": "Prof. Bolton",
            "Rating": "35",
            "Genre 1": "Horror"
        },
        "322": {
            "Name": "After Midnight",
            "Number": 608,
            "Year": "1989",
            "Actor": "Ramy Zada",
            "Role": "Prof. Edward Derek (segment \"Allison's Story\")",
            "Rating": "23",
            "Genre 1": "Horror",
            "Genre 2": "Thriller"
        },
        "323": {
            "Name": "The Brain Eaters",
            "Number": 609,
            "Year": "1958",
            "Actor": "Leonard Nimoy",
            "Role": "Professor Cole",
            "Rating": "34",
            "Genre 1": "Sci-Fi",
            "Genre 2": "Horror"
        },
        "324": {
            "Name": "The Brain Eaters",
            "Number": 609,
            "Year": "1958",
            "Actor": "Saul Bronson",
            "Role": "Prof. Helsingman",
            "Rating": "34",
            "Genre 1": "Sci-Fi",
            "Genre 2": "Horror"
        },
        "325": {
            "Name": "Sabirni centar",
            "Number": 610,
            "Year": "1989",
            "Actor": "Rade Markovic",
            "Role": "Profesor Misa",
            "Rating": "NONE",
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Fantasy"
        },
        "326": {
            "Name": "Gorgo",
            "Number": 612,
            "Year": "1961",
            "Actor": "Joseph O'Conor",
            "Role": "Prof. Hendricks",
            "Rating": "63",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi"
        },
        "327": {
            "Name": "Gorgo",
            "Number": 612,
            "Year": "1961",
            "Actor": "Bruce Seton",
            "Role": "Prof. Flaherty",
            "Rating": "63",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi"
        },
        "328": {
            "Name": "Frostbitten",
            "Number": 615,
            "Year": "2006",
            "Actor": "Carl-\u00c5ke Eriksson",
            "Role": "Prof. Gerhard Beckert",
            "Rating": "63",
            "Genre 1": "Horror",
            "Genre 2": "Comedy"
        },
        "329": {
            "Name": "High Time",
            "Number": 618,
            "Year": "1960",
            "Actor": "Nicole Maurey",
            "Role": "Prof. Helene Gauthier",
            "Rating": "9",
            "Genre 1": "Comedy",
            "Genre 2": "Musical"
        },
        "330": {
            "Name": "High Time",
            "Number": 618,
            "Year": "1960",
            "Actor": "Gavin MacLeod",
            "Role": "Professor Thayer",
            "Rating": "9",
            "Genre 1": "Comedy",
            "Genre 2": "Musical"
        },
        "331": {
            "Name": "Desert Blue",
            "Number": 620,
            "Year": "1998",
            "Actor": "John Heard",
            "Role": "Prof. Lance Davidson",
            "Rating": "29",
            "Genre 1": "Drama"
        },
        "332": {
            "Name": "The Laws of Thermodynamics",
            "Number": 628,
            "Year": "2018",
            "Actor": "Josep Maria Pou",
            "Role": "Profesor Amat",
            "Rating": 45,
            "Genre 1": "Comedy"
        },
        "333": {
            "Name": "Premi\u00e8re ann\u00e9e",
            "Number": 632,
            "Year": "2018",
            "Actor": "Philippe Leroy",
            "Role": "Professeur",
            "Rating": "18",
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "334": {
            "Name": "Disgrace",
            "Number": 642,
            "Year": "2008",
            "Actor": "John Malkovich",
            "Role": "Professor David Lurie",
            "Rating": 71,
            "Genre 1": "Drama"
        },
        "335": {
            "Name": "Bon Voyage",
            "Number": 646,
            "Year": "2003",
            "Actor": "Jean-Marc Stehl\u00e9",
            "Role": "Professeur Kopolski",
            "Rating": 68,
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Mystery",
            "Genre 4": "Romance"
        },
        "336": {
            "Name": "Metamorphosis",
            "Number": 649,
            "Year": "1990",
            "Actor": "Stephen Brown",
            "Role": "Professor Lloyd",
            "Rating": "35",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi"
        },
        "337": {
            "Name": "Metamorphosis",
            "Number": 649,
            "Year": "1990",
            "Actor": "Tom Story",
            "Role": "Professor Huston",
            "Rating": "35",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi"
        },
        "338": {
            "Name": "Margie",
            "Number": 653,
            "Year": "1946",
            "Actor": "Glenn Langan",
            "Role": "Prof. Ralph Fontayne",
            "Rating": "5",
            "Genre 1": "Comedy",
            "Genre 2": "Music",
            "Genre 3": "Romance"
        },
        "339": {
            "Name": "Son of Dracula",
            "Number": 654,
            "Year": "1943",
            "Actor": "J. Edward Bromberg",
            "Role": "Professor Lazlo",
            "Rating": "60",
            "Genre 1": "Drama",
            "Genre 2": "Fantasy",
            "Genre 3": "Horror",
            "Genre 4": "Romance"
        },
        "340": {
            "Name": "'Pimpernel' Smith",
            "Number": 661,
            "Year": "1941",
            "Actor": "Leslie Howard",
            "Role": "Professor Horatio Smith",
            "Rating": "8",
            "Genre 1": "Adventure",
            "Genre 2": "Drama",
            "Genre 3": "Thriller",
            "Genre 4": "War"
        },
        "341": {
            "Name": "Raiders of the Lost Shark",
            "Number": 663,
            "Year": "2015",
            "Actor": "Candice Lidstone",
            "Role": "Prof. Carly Reynolds",
            "Rating": "23",
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Comedy",
            "Genre 4": "Horror"
        },
        "342": {
            "Name": "Konga",
            "Number": 667,
            "Year": "1961",
            "Actor": "George Pastell",
            "Role": "Professor Tagore",
            "Rating": "54",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Thriller"
        },
        "343": {
            "Name": "Fei Ying",
            "Number": 668,
            "Year": "2004",
            "Actor": "Daming Chen",
            "Role": "Professor Ho Chung",
            "Rating": "29",
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Sci-Fi"
        },
        "344": {
            "Name": "Blue Denim",
            "Number": 670,
            "Year": "1959",
            "Actor": "Vaughn Taylor",
            "Role": "Professor Willard",
            "Rating": "6",
            "Genre 1": "Drama",
            "Genre 2": "Romance"
        },
        "345": {
            "Name": "The Passionate Friends",
            "Number": 676,
            "Year": "1949",
            "Actor": "Trevor Howard",
            "Role": "Professor Steven Stratton",
            "Rating": "17",
            "Genre 1": "Drama",
            "Genre 2": "Romance"
        },
        "346": {
            "Name": "Sexykiller, morir\u00e1s por ella",
            "Number": 677,
            "Year": "2008",
            "Actor": "Juan Carlos Vellido",
            "Role": "Profesor Anatom\u00eda",
            "Rating": "42",
            "Genre 1": "Comedy",
            "Genre 2": "Horror",
            "Genre 3": "Sci-Fi",
            "Genre 4": "Thriller"
        },
        "347": {
            "Name": "Those Fantastic Flying Fools",
            "Number": 681,
            "Year": "1967",
            "Actor": "Gert Fr\u00f6be",
            "Role": "Professor von Bulow",
            "Rating": "16",
            "Genre 1": "Adventure",
            "Genre 2": "Comedy",
            "Genre 3": "Fantasy",
            "Genre 4": "Sci-Fi"
        },
        "348": {
            "Name": "Those Fantastic Flying Fools",
            "Number": 681,
            "Year": "1967",
            "Actor": "Harry Brogan",
            "Role": "Professor Dingle",
            "Rating": "16",
            "Genre 1": "Adventure",
            "Genre 2": "Comedy",
            "Genre 3": "Fantasy",
            "Genre 4": "Sci-Fi"
        },
        "349": {
            "Name": "Back from Eternity",
            "Number": 682,
            "Year": "1956",
            "Actor": "Cameron Prud'Homme",
            "Role": "Prof. Henry Spangler",
            "Rating": "10",
            "Genre 1": "Adventure",
            "Genre 2": "Drama"
        },
        "350": {
            "Name": "Peggy",
            "Number": 686,
            "Year": "1950",
            "Actor": "Charles Coburn",
            "Role": "Professor 'Brooks' Brookfield",
            "Rating": "NONE",
            "Genre 1": "Comedy"
        },
        "351": {
            "Name": "Wilson",
            "Number": 691,
            "Year": "1944",
            "Actor": "Charles Coburn",
            "Role": "Professor Henry Holmes",
            "Rating": "17",
            "Genre 1": "Biography",
            "Genre 2": "Drama",
            "Genre 3": "History",
            "Genre 4": "Music"
        },
        "352": {
            "Name": "Tobor the Great",
            "Number": 695,
            "Year": "1954",
            "Actor": "Taylor Holmes",
            "Role": "Prof. Arnold Nordstrom",
            "Rating": "27",
            "Genre 1": "Adventure",
            "Genre 2": "Family",
            "Genre 3": "Sci-Fi"
        },
        "353": {
            "Name": "The Internecine Project",
            "Number": 696,
            "Year": "1974",
            "Actor": "James Coburn",
            "Role": "Professor Robert Elliot",
            "Rating": "28",
            "Genre 1": "Action",
            "Genre 2": "Thriller"
        },
        "354": {
            "Name": "The Return of Count Yorga",
            "Number": 698,
            "Year": "1971",
            "Actor": "George Macready",
            "Role": "Prof. Rightstat",
            "Rating": "44",
            "Genre 1": "Horror"
        },
        "355": {
            "Name": "A Matter of Faith",
            "Number": 701,
            "Year": "2014",
            "Actor": "Harry Anderson",
            "Role": "Professor Kaman",
            "Rating": "3",
            "Genre 1": "Drama"
        },
        "356": {
            "Name": "A Matter of Faith",
            "Number": 701,
            "Year": "2014",
            "Actor": "Clarence Gilyard Jr.",
            "Role": "Professor Portland",
            "Rating": "3",
            "Genre 1": "Drama"
        },
        "357": {
            "Name": "Black Friday",
            "Number": 708,
            "Year": "1940",
            "Actor": "Stanley Ridges",
            "Role": "Prof. George Kingsley",
            "Rating": "44",
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Horror",
            "Genre 4": "Mystery"
        },
        "358": {
            "Name": "This Land Is Mine",
            "Number": 709,
            "Year": "1943",
            "Actor": "Philip Merivale",
            "Role": "Professor Sorel",
            "Rating": "21",
            "Genre 1": "Drama",
            "Genre 2": "War"
        },
        "359": {
            "Name": "One Hour with You",
            "Number": 712,
            "Year": "1932",
            "Actor": "Roland Young",
            "Role": "Professor Olivier",
            "Rating": "30",
            "Genre 1": "Comedy",
            "Genre 2": "Musical",
            "Genre 3": "Romance"
        },
        "360": {
            "Name": "Frogtown II",
            "Number": 713,
            "Year": "1992",
            "Actor": "Brion James",
            "Role": "Professor Tanzer",
            "Rating": "9",
            "Genre 1": "Sci-Fi",
            "Genre 2": "Action"
        },
        "361": {
            "Name": "Bathing Beauty",
            "Number": 715,
            "Year": "1944",
            "Actor": "Bill Goodwin",
            "Role": "Professor Willis Evans",
            "Rating": "11",
            "Genre 1": "Comedy",
            "Genre 2": "Musical"
        },
        "362": {
            "Name": "Bathing Beauty",
            "Number": 715,
            "Year": "1944",
            "Actor": "Francis Pierlot",
            "Role": "Professor Hendricks",
            "Rating": "11",
            "Genre 1": "Comedy",
            "Genre 2": "Musical"
        },
        "363": {
            "Name": "The Unnamable II: The Statement of Randolph Carter",
            "Number": 717,
            "Year": "1992",
            "Actor": "John Rhys-Davies",
            "Role": "Professor Warren",
            "Rating": "17",
            "Genre 1": "Horror"
        },
        "364": {
            "Name": "The Unnamable II: The Statement of Randolph Carter",
            "Number": 717,
            "Year": "1992",
            "Actor": "Bryan Clark",
            "Role": "Prof. Thurber",
            "Rating": "17",
            "Genre 1": "Horror"
        },
        "365": {
            "Name": "The Unnamable II: The Statement of Randolph Carter",
            "Number": 717,
            "Year": "1992",
            "Actor": "Gary Pike",
            "Role": "Prof. Mendez",
            "Rating": "17",
            "Genre 1": "Horror"
        },
        "366": {
            "Name": "Hour of Glory",
            "Number": 718,
            "Year": "1949",
            "Actor": "Milton Rosmer",
            "Role": "Prof. Mair",
            "Rating": "41",
            "Genre 1": "Drama",
            "Genre 2": "Romance",
            "Genre 3": "Thriller",
            "Genre 4": "War"
        },
        "367": {
            "Name": "Pterodactyl",
            "Number": 720,
            "Year": "2005",
            "Actor": "Cameron Daddo",
            "Role": "Prof. Michael Lovecraft",
            "Rating": "17",
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Horror",
            "Genre 4": "Sci-Fi"
        },
        "368": {
            "Name": "Death Tunnel",
            "Number": 722,
            "Year": "2005",
            "Actor": "Gill Gayle",
            "Role": "Professor",
            "Rating": "35",
            "Genre 1": "Horror"
        },
        "369": {
            "Name": "The Green Years",
            "Number": 727,
            "Year": "1946",
            "Actor": "Henry Stephenson",
            "Role": "Prof. Rattray Blakely",
            "Rating": "5",
            "Genre 1": "Drama"
        },
        "370": {
            "Name": "Lo dejo cuando quiera",
            "Number": 729,
            "Year": "2019",
            "Actor": "Carolina Herrera",
            "Role": "Profesora Sustituta",
            "Rating": "NONE",
            "Genre 1": "Comedy"
        },
        "371": {
            "Name": "Weird Woman",
            "Number": 741,
            "Year": "1944",
            "Actor": "Ralph Morgan",
            "Role": "Prof. Millard Sawtelle",
            "Rating": "27",
            "Genre 1": "Horror",
            "Genre 2": "Mystery"
        },
        "372": {
            "Name": "Weird Woman",
            "Number": 741,
            "Year": "1944",
            "Actor": "Harry Hayden",
            "Role": "Prof. Septimus Carr",
            "Rating": "27",
            "Genre 1": "Horror",
            "Genre 2": "Mystery"
        },
        "373": {
            "Name": "The Petty Girl",
            "Number": 742,
            "Year": "1950",
            "Actor": "Joan Caulfield",
            "Role": "Prof. Victoria Braymore",
            "Rating": "1",
            "Genre 1": "Biography",
            "Genre 2": "Comedy",
            "Genre 3": "Musical",
            "Genre 4": "Romance"
        },
        "374": {
            "Name": "The Petty Girl",
            "Number": 742,
            "Year": "1950",
            "Actor": "Mary Wickes",
            "Role": "Prof. Whitman",
            "Rating": "1",
            "Genre 1": "Biography",
            "Genre 2": "Comedy",
            "Genre 3": "Musical",
            "Genre 4": "Romance"
        },
        "375": {
            "Name": "Five Came Back",
            "Number": 748,
            "Year": "1939",
            "Actor": "C. Aubrey Smith",
            "Role": "Prof. Henry Spengler",
            "Rating": "20",
            "Genre 1": "Adventure",
            "Genre 2": "Drama",
            "Genre 3": "Thriller"
        },
        "376": {
            "Name": "The Mummy's Ghost",
            "Number": 749,
            "Year": "1944",
            "Actor": "Frank Reicher",
            "Role": "Professor Norman",
            "Rating": "44",
            "Genre 1": "Fantasy",
            "Genre 2": "Horror"
        },
        "377": {
            "Name": "Monster on the Campus",
            "Number": 750,
            "Year": "1958",
            "Actor": "Arthur Franz",
            "Role": "Professor Donald Blake",
            "Rating": "39",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi"
        },
        "378": {
            "Name": "Monster on the Campus",
            "Number": 750,
            "Year": "1958",
            "Actor": "Alexander Lockwood",
            "Role": "Professor Gilbert Howard",
            "Rating": "39",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi"
        },
        "379": {
            "Name": "Sherlock Holmes und das Halsband des Todes",
            "Number": 751,
            "Year": "1962",
            "Actor": "Hans S\u00f6hnker",
            "Role": "Prof. Moriarty",
            "Rating": "13",
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Mystery",
            "Genre 4": "Thriller"
        },
        "380": {
            "Name": "Petersen",
            "Number": 755,
            "Year": "1974",
            "Actor": "Arthur Dignam",
            "Role": "Prof. Charles Kent",
            "Rating": "2",
            "Genre 1": "Drama"
        },
        "381": {
            "Name": "Professor",
            "Number": 757,
            "Year": "1962",
            "Actor": "Shammi Kapoor",
            "Role": "Professor Pritam Khanna",
            "Rating": "NONE",
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Musical",
            "Genre 4": "Romance"
        },
        "382": {
            "Name": "Mama Dracula",
            "Number": 759,
            "Year": "1980",
            "Actor": "Jimmy Shuman",
            "Role": "Professor Van Bloed",
            "Rating": "7",
            "Genre 1": "Comedy",
            "Genre 2": "Horror"
        },
        "383": {
            "Name": "The Ghoul",
            "Number": 762,
            "Year": "1933",
            "Actor": "Boris Karloff",
            "Role": "Prof. Henry Morlant",
            "Rating": "42",
            "Genre 1": "Action",
            "Genre 2": "Drama",
            "Genre 3": "Horror",
            "Genre 4": "Mystery"
        },
        "384": {
            "Name": "Partner",
            "Number": 763,
            "Year": "1968",
            "Actor": "Sergio Tofano",
            "Role": "Professor Petrushka",
            "Rating": "12",
            "Genre 1": "Drama"
        },
        "385": {
            "Name": "Partner",
            "Number": 763,
            "Year": "1968",
            "Actor": "Giulio Cesare Castello",
            "Role": "Professor Mozzoni",
            "Rating": "12",
            "Genre 1": "Drama"
        },
        "386": {
            "Name": "Partner",
            "Number": 763,
            "Year": "1968",
            "Actor": "Antonio Maestri",
            "Role": "Professor 'Tre Zampe'",
            "Rating": "12",
            "Genre 1": "Drama"
        },
        "387": {
            "Name": "Partner",
            "Number": 763,
            "Year": "1968",
            "Actor": "Mario Venturini",
            "Role": "Professor",
            "Rating": "12",
            "Genre 1": "Drama"
        },
        "388": {
            "Name": "The Chairman",
            "Number": 771,
            "Year": "1969",
            "Actor": "Keye Luke",
            "Role": "Professor Soong Li",
            "Rating": "22",
            "Genre 1": "Action",
            "Genre 2": "Drama",
            "Genre 3": "Thriller"
        },
        "389": {
            "Name": "Mother Is a Freshman",
            "Number": 772,
            "Year": "1949",
            "Actor": "Van Johnson",
            "Role": "Professor Richard Michaels",
            "Rating": "5",
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "390": {
            "Name": "Strange Illusion",
            "Number": 777,
            "Year": "1945",
            "Actor": "Charles Arnt",
            "Role": "Professor Muhlbach",
            "Rating": "23",
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Film-Noir",
            "Genre 4": "Mystery"
        },
        "391": {
            "Name": "The American Astronaut",
            "Number": 780,
            "Year": "2001",
            "Actor": "Rocco Sisto",
            "Role": "Professor Hess",
            "Rating": 51,
            "Genre 1": "Musical",
            "Genre 2": "Comedy",
            "Genre 3": "Sci-Fi"
        },
        "392": {
            "Name": "Take One False Step",
            "Number": 782,
            "Year": "1949",
            "Actor": "Felix Bressart",
            "Role": "Professor Morris Avrum",
            "Rating": "5",
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Film-Noir",
            "Genre 4": "Mystery"
        },
        "393": {
            "Name": "Zotz!",
            "Number": 783,
            "Year": "1962",
            "Actor": "Tom Poston",
            "Role": "Prof. Jonathan Jones",
            "Rating": "23",
            "Genre 1": "Comedy",
            "Genre 2": "Fantasy"
        },
        "394": {
            "Name": "Zotz!",
            "Number": 783,
            "Year": "1962",
            "Actor": "Julia Meade",
            "Role": "Prof. Virginia Fenster",
            "Rating": "23",
            "Genre 1": "Comedy",
            "Genre 2": "Fantasy"
        },
        "395": {
            "Name": "Battle of the Worlds",
            "Number": 789,
            "Year": "1961",
            "Actor": "Claude Rains",
            "Role": "Prof. Benson",
            "Rating": "22",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi"
        },
        "396": {
            "Name": "International House",
            "Number": 792,
            "Year": "1933",
            "Actor": "W.C. Fields",
            "Role": "Professor Henry R. Quail",
            "Rating": "16",
            "Genre 1": "Comedy"
        },
        "397": {
            "Name": "So Ends Our Night",
            "Number": 795,
            "Year": "1941",
            "Actor": "William Stack",
            "Role": "Professor Meyer",
            "Rating": "5",
            "Genre 1": "Drama",
            "Genre 2": "War"
        },
        "398": {
            "Name": "It Happens Every Spring",
            "Number": 797,
            "Year": "1949",
            "Actor": "Ray Milland",
            "Role": "Prof. Vernon K. Simpson",
            "Rating": "14",
            "Genre 1": "Comedy",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Sport"
        },
        "399": {
            "Name": "It Happens Every Spring",
            "Number": 797,
            "Year": "1949",
            "Actor": "Ray Collins",
            "Role": "Prof. Alfred Greenleaf",
            "Rating": "14",
            "Genre 1": "Comedy",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Sport"
        },
        "400": {
            "Name": "Shagird",
            "Number": 799,
            "Year": "1967",
            "Actor": "I.S. Johar",
            "Role": "Prof. Brij Mohan Agnihotri 'Birju'",
            "Rating": "NONE",
            "Genre 1": "Comedy",
            "Genre 2": "Musical",
            "Genre 3": "Romance"
        },
        "401": {
            "Name": "Mystery Liner",
            "Number": 803,
            "Year": "1934",
            "Actor": "Ralph Lewis",
            "Role": "Prof. Grimson",
            "Rating": "9",
            "Genre 1": "Adventure",
            "Genre 2": "Mystery"
        },
        "402": {
            "Name": "The Man on the Eiffel Tower",
            "Number": 804,
            "Year": "1949",
            "Actor": "Wilfrid Hyde-White",
            "Role": "Professor Grollet",
            "Rating": "8",
            "Genre 1": "Mystery",
            "Genre 2": "Thriller"
        },
        "403": {
            "Name": "Children of the Revolution",
            "Number": 810,
            "Year": "1996",
            "Actor": "John Gaden",
            "Role": "Prof. C.W. 'Wilf' Wilke",
            "Rating": 76,
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "404": {
            "Name": "The Quatermass Conclusion",
            "Number": 811,
            "Year": "1979",
            "Actor": "John Mills",
            "Role": "Prof. Bernard Quatermass",
            "Rating": "3",
            "Genre 1": "Drama",
            "Genre 2": "Mystery",
            "Genre 3": "Sci-Fi",
            "Genre 4": "Thriller"
        },
        "405": {
            "Name": "The Mysterious Mr. Wong",
            "Number": 813,
            "Year": "1934",
            "Actor": "Luke Chan",
            "Role": "Prof. Chan Fu",
            "Rating": "14",
            "Genre 1": "Mystery"
        },
        "406": {
            "Name": "Notte prima degli esami",
            "Number": 815,
            "Year": "2006",
            "Actor": "Giorgio Faletti",
            "Role": "Prof. Martinelli",
            "Rating": "7",
            "Genre 1": "Comedy"
        },
        "407": {
            "Name": "Notte prima degli esami",
            "Number": 815,
            "Year": "2006",
            "Actor": "Cristina Ramella",
            "Role": "Prof.ssa Lattanzi",
            "Rating": "7",
            "Genre 1": "Comedy"
        },
        "408": {
            "Name": "For Men Only",
            "Number": 818,
            "Year": "1952",
            "Actor": "O.Z. Whitehead",
            "Role": "Prof. Bixby",
            "Rating": "4",
            "Genre 1": "Crime",
            "Genre 2": "Drama"
        },
        "409": {
            "Name": "For Men Only",
            "Number": 818,
            "Year": "1952",
            "Actor": "A. Cameron Grant",
            "Role": "Prof. Edwards",
            "Rating": "4",
            "Genre 1": "Crime",
            "Genre 2": "Drama"
        },
        "410": {
            "Name": "The Young, the Evil and the Savage",
            "Number": 821,
            "Year": "1968",
            "Actor": "Aldo De Carellis",
            "Role": "Professor Andr\u00e9",
            "Rating": "29",
            "Genre 1": "Mystery",
            "Genre 2": "Thriller"
        },
        "411": {
            "Name": "He ni zai yi qi",
            "Number": 824,
            "Year": "2002",
            "Actor": "Zhiwen Wang",
            "Role": "Prof. Jiang",
            "Rating": 60,
            "Genre 1": "Drama",
            "Genre 2": "Music"
        },
        "412": {
            "Name": "He ni zai yi qi",
            "Number": 824,
            "Year": "2002",
            "Actor": "Kaige Chen",
            "Role": "Prof. Yu Shifeng",
            "Rating": 60,
            "Genre 1": "Drama",
            "Genre 2": "Music"
        },
        "413": {
            "Name": "He ni zai yi qi",
            "Number": 824,
            "Year": "2002",
            "Actor": "Hye-ri Kim",
            "Role": "Prof. Yu's Wife",
            "Rating": 60,
            "Genre 1": "Drama",
            "Genre 2": "Music"
        },
        "414": {
            "Name": "Father Was a Fullback",
            "Number": 828,
            "Year": "1949",
            "Actor": "Jim Backus",
            "Role": "Professor Sullivan",
            "Rating": "4",
            "Genre 1": "Comedy",
            "Genre 2": "Sport"
        },
        "415": {
            "Name": "Eruption: LA",
            "Number": 829,
            "Year": "2018",
            "Actor": "Harry Van Gorkum",
            "Role": "Professor Irwin",
            "Rating": "1",
            "Genre 1": "Action",
            "Genre 2": "Adventure",
            "Genre 3": "Sci-Fi",
            "Genre 4": "Thriller"
        },
        "416": {
            "Name": "Who Wants to Kill Jessie?",
            "Number": 831,
            "Year": "1966",
            "Actor": "Walter Taub",
            "Role": "Profesor",
            "Rating": "50",
            "Genre 1": "Comedy",
            "Genre 2": "Sci-Fi"
        },
        "417": {
            "Name": "Janie",
            "Number": 833,
            "Year": "1944",
            "Actor": "Alan Hale",
            "Role": "Prof. Matthew Q. Reardon",
            "Rating": "5",
            "Genre 1": "Comedy",
            "Genre 2": "Romance",
            "Genre 3": "War"
        },
        "418": {
            "Name": "Her Husband's Affairs",
            "Number": 834,
            "Year": "1947",
            "Actor": "Mikhail Rasumny",
            "Role": "Prof. Emil Glinka",
            "Rating": "3",
            "Genre 1": "Comedy",
            "Genre 2": "Sci-Fi"
        },
        "419": {
            "Name": "Mara and the Firebringer",
            "Number": 839,
            "Year": "2015",
            "Actor": "Jan Josef Liefers",
            "Role": "Professor Weissinger",
            "Rating": "35",
            "Genre 1": "Drama",
            "Genre 2": "Fantasy"
        },
        "420": {
            "Name": "Handsome Harry",
            "Number": 840,
            "Year": "2009",
            "Actor": "Aidan Quinn",
            "Role": "Prof. Porter",
            "Rating": 59,
            "Genre 1": "Drama"
        },
        "421": {
            "Name": "The Power",
            "Number": 844,
            "Year": "1984",
            "Actor": "Stan Weston",
            "Role": "Professor Wilson",
            "Rating": "19",
            "Genre 1": "Horror"
        },
        "422": {
            "Name": "Speak Easily",
            "Number": 845,
            "Year": "1932",
            "Actor": "Buster Keaton",
            "Role": "Professor Timoleon Zanders Post",
            "Rating": "17",
            "Genre 1": "Comedy"
        },
        "423": {
            "Name": "50 Ways to Leave Your Lover",
            "Number": 849,
            "Year": "2004",
            "Actor": "Roger Kramer",
            "Role": "Professor Jansen",
            "Rating": "6",
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "424": {
            "Name": "50 Ways to Leave Your Lover",
            "Number": 849,
            "Year": "2004",
            "Actor": "Gary Rae",
            "Role": "Professor Silverman",
            "Rating": "6",
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "425": {
            "Name": "The Heavenly Body",
            "Number": 853,
            "Year": "1944",
            "Actor": "Henry O'Neill",
            "Role": "Prof. Stowe",
            "Rating": "8",
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "426": {
            "Name": "Skriv\u00e1nci na niti",
            "Number": 855,
            "Year": "1969",
            "Actor": "Vlastimil Brodsk\u00fd",
            "Role": "Professor",
            "Rating": "13",
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "427": {
            "Name": "Invitation",
            "Number": 862,
            "Year": "1952",
            "Actor": "Alex Gerry",
            "Role": "Professor Redwick",
            "Rating": "NONE",
            "Genre 1": "Drama",
            "Genre 2": "Romance"
        },
        "428": {
            "Name": "Goodbye, My Fancy",
            "Number": 865,
            "Year": "1951",
            "Actor": "John Qualen",
            "Role": "Professor Dingley",
            "Rating": "5",
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "429": {
            "Name": "Eolomea",
            "Number": 866,
            "Year": "1972",
            "Actor": "Cox Habbema",
            "Role": "Prof. Maria Scholl",
            "Rating": "17",
            "Genre 1": "Drama",
            "Genre 2": "Romance",
            "Genre 3": "Sci-Fi"
        },
        "430": {
            "Name": "Eolomea",
            "Number": 866,
            "Year": "1972",
            "Actor": "Rolf Hoppe",
            "Role": "Prof. Oli Tal",
            "Rating": "17",
            "Genre 1": "Drama",
            "Genre 2": "Romance",
            "Genre 3": "Sci-Fi"
        },
        "431": {
            "Name": "Love and Other Catastrophes",
            "Number": 871,
            "Year": "1996",
            "Actor": "Kim Gyngell",
            "Role": "Professor Richard Leach",
            "Rating": 58,
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "432": {
            "Name": "The Book of Stars",
            "Number": 875,
            "Year": "1999",
            "Actor": "Delroy Lindo",
            "Role": "Professor",
            "Rating": "4",
            "Genre 1": "Drama"
        },
        "433": {
            "Name": "Rise and Shine",
            "Number": 877,
            "Year": "1941",
            "Actor": "Donald Meek",
            "Role": "Professor Philip Murray",
            "Rating": "NONE",
            "Genre 1": "Comedy",
            "Genre 2": "Crime",
            "Genre 3": "Musical",
            "Genre 4": "Romance"
        },
        "434": {
            "Name": "Satanik",
            "Number": 879,
            "Year": "1968",
            "Actor": "Nerio Bernardi",
            "Role": "Professor Greaves",
            "Rating": "25",
            "Genre 1": "Crime",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Thriller"
        },
        "435": {
            "Name": "Defying Gravity",
            "Number": 880,
            "Year": "1997",
            "Actor": "Bob Peterson",
            "Role": "Professor",
            "Rating": 45,
            "Genre 1": "Drama",
            "Genre 2": "Romance",
            "Genre 3": "Sport"
        },
        "436": {
            "Name": "Hotori no Sakuko",
            "Number": 885,
            "Year": "2013",
            "Actor": "Takashi Ohtake",
            "Role": "Professor",
            "Rating": "26",
            "Genre 1": "Drama"
        },
        "437": {
            "Name": "Dancing Co-Ed",
            "Number": 889,
            "Year": "1939",
            "Actor": "Monty Woolley",
            "Role": "Professor Lange",
            "Rating": "7",
            "Genre 1": "Comedy",
            "Genre 2": "Music",
            "Genre 3": "Romance"
        },
        "438": {
            "Name": "Live, Love and Learn",
            "Number": 890,
            "Year": "1937",
            "Actor": "Al Shean",
            "Role": "Professor Fraum",
            "Rating": "4",
            "Genre 1": "Comedy"
        },
        "439": {
            "Name": "His Brother's Wife",
            "Number": 896,
            "Year": "1936",
            "Actor": "Jean Hersholt",
            "Role": "Professor Fahrenheim",
            "Rating": "1",
            "Genre 1": "Drama",
            "Genre 2": "Romance"
        },
        "440": {
            "Name": "Erotikon",
            "Number": 898,
            "Year": "1920",
            "Actor": "Anders de Wahl",
            "Role": "Professor Leo Charpentier",
            "Rating": "10",
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "441": {
            "Name": "Heaven with a Barbed Wire Fence",
            "Number": 910,
            "Year": "1939",
            "Actor": "Raymond Walburn",
            "Role": "Prof. B. Townsend Thayer",
            "Rating": "4",
            "Genre 1": "Drama"
        },
        "442": {
            "Name": "Bulundi",
            "Number": 911,
            "Year": "1981",
            "Actor": "Raaj Kumar",
            "Role": "Prof. Satish Khurana",
            "Rating": "NONE",
            "Genre 1": "Action",
            "Genre 2": "Crime",
            "Genre 3": "Drama"
        },
        "443": {
            "Name": "The Housekeeper's Daughter",
            "Number": 912,
            "Year": "1939",
            "Actor": "John Hyams",
            "Role": "Professor Randall",
            "Rating": "2",
            "Genre 1": "Adventure",
            "Genre 2": "Comedy",
            "Genre 3": "Crime"
        },
        "444": {
            "Name": "Pane, vy jste vdova!",
            "Number": 913,
            "Year": "1971",
            "Actor": "Milos Kopeck\u00fd",
            "Role": "Professor Somr,maj\u00edtel sanatoria",
            "Rating": "6",
            "Genre 1": "Comedy",
            "Genre 2": "Sci-Fi"
        },
        "445": {
            "Name": "This Is Our Time",
            "Number": 914,
            "Year": "2013",
            "Actor": "Bruce Marchiano",
            "Role": "Professor Callahan",
            "Rating": "1",
            "Genre 1": "Drama"
        },
        "446": {
            "Name": "Up and Down",
            "Number": 919,
            "Year": "2004",
            "Actor": "Jan Tr\u00edska",
            "Role": "Professor Otakar Horeck\u00fd",
            "Rating": 78,
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "447": {
            "Name": "Das Versprechen",
            "Number": 920,
            "Year": "1994",
            "Actor": "Otto Sander",
            "Role": "Professor Lorenz",
            "Rating": "12",
            "Genre 1": "Drama",
            "Genre 2": "Romance"
        },
        "448": {
            "Name": "La controfigura",
            "Number": 921,
            "Year": "1971",
            "Actor": "Antonio Pierfederici",
            "Role": "Professor Bergamo",
            "Rating": "1",
            "Genre 1": "Mystery",
            "Genre 2": "Thriller"
        },
        "449": {
            "Name": "Sir",
            "Number": 922,
            "Year": "1993",
            "Actor": "Naseeruddin Shah",
            "Role": "Prof. Amar Verma",
            "Rating": "NONE",
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Romance"
        },
        "450": {
            "Name": "The Newest Pledge",
            "Number": 924,
            "Year": "2010",
            "Actor": "Jason Mewes",
            "Role": "Professor Street",
            "Rating": "5",
            "Genre 1": "Comedy"
        },
        "451": {
            "Name": "Seducci\u00f3n (aka Secreto De Amor)",
            "Number": 928,
            "Year": "2014",
            "Actor": "Alejandro Camacho",
            "Role": "Professor",
            "Rating": "NONE",
            "Genre 1": "Drama"
        },
        "452": {
            "Name": "Seducci\u00f3n (aka Secreto De Amor)",
            "Number": 928,
            "Year": "2014",
            "Actor": "Tere Salinas",
            "Role": "Professor's wife",
            "Rating": "NONE",
            "Genre 1": "Drama"
        },
        "453": {
            "Name": "Hitler",
            "Number": 931,
            "Year": "1996",
            "Actor": "M.G. Soman",
            "Role": "Professor",
            "Rating": "NONE",
            "Genre 1": "Action",
            "Genre 2": "Comedy",
            "Genre 3": "Drama"
        },
        "454": {
            "Name": "The Lady and the Monster",
            "Number": 934,
            "Year": "1944",
            "Actor": "Erich von Stroheim",
            "Role": "Prof. Franz Mueller",
            "Rating": "17",
            "Genre 1": "Horror",
            "Genre 2": "Sci-Fi",
            "Genre 3": "Thriller"
        },
        "455": {
            "Name": "T\u00e4hmin\u00e4",
            "Number": 937,
            "Year": "1993",
            "Actor": "Hasan Mammadov",
            "Role": "Professor Zeynalli",
            "Rating": "NONE",
            "Genre 1": "Drama",
            "Genre 2": "Romance"
        },
        "456": {
            "Name": "O roz gatos",
            "Number": 938,
            "Year": "1985",
            "Actor": "Antonis Trikaminas",
            "Role": "Professor Sokratis",
            "Rating": "2",
            "Genre 1": "Comedy"
        },
        "457": {
            "Name": "The Return of October",
            "Number": 943,
            "Year": "1948",
            "Actor": "Glenn Ford",
            "Role": "Prof. Bentley 'Bass' Bassett Jr.",
            "Rating": "5",
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "458": {
            "Name": "The Return of October",
            "Number": 943,
            "Year": "1948",
            "Actor": "Stephen Dunne",
            "Role": "Prof. Stewart",
            "Rating": "5",
            "Genre 1": "Comedy",
            "Genre 2": "Drama"
        },
        "459": {
            "Name": "Good News",
            "Number": 947,
            "Year": "1930",
            "Actor": "Frank McGlynn Sr.",
            "Role": "Prof. Kenyon",
            "Rating": "2",
            "Genre 1": "Comedy",
            "Genre 2": "Musical"
        },
        "460": {
            "Name": "College Confidential",
            "Number": 950,
            "Year": "1960",
            "Actor": "Herbert Marshall",
            "Role": "Professor Henry Addison",
            "Rating": "2",
            "Genre 1": "Drama"
        },
        "461": {
            "Name": "College Girls",
            "Number": 951,
            "Year": "1968",
            "Actor": "Sean O'Hara",
            "Role": "Professor Bryce",
            "Rating": "3",
            "Genre 1": "Comedy"
        },
        "462": {
            "Name": "Tajemstv\u00ed Ocelov\u00e9ho mesta",
            "Number": 952,
            "Year": "1979",
            "Actor": "Josef Vinkl\u00e1r",
            "Role": "Profesor chemie Eric Janus",
            "Rating": "3",
            "Genre 1": "Adventure",
            "Genre 2": "Sci-Fi"
        },
        "463": {
            "Name": "Violenza al sole",
            "Number": 953,
            "Year": "1969",
            "Actor": "Gunnar Bj\u00f6rnstrand",
            "Role": "Prof. Gunnar Lindmark",
            "Rating": "1",
            "Genre 1": "Crime",
            "Genre 2": "Drama",
            "Genre 3": "Mystery",
            "Genre 4": "Thriller"
        },
        "464": {
            "Name": "In the Eye of the Snake",
            "Number": 954,
            "Year": "1990",
            "Actor": "Malcolm McDowell",
            "Role": "Professor Baldwin",
            "Rating": "3",
            "Genre 1": "Thriller"
        },
        "465": {
            "Name": "Einer von uns beiden",
            "Number": 965,
            "Year": "1974",
            "Actor": "Klaus Schwarzkopf",
            "Role": "Professor Kolczyk",
            "Rating": "3",
            "Genre 1": "Action",
            "Genre 2": "Romance",
            "Genre 3": "Thriller"
        },
        "466": {
            "Name": "Cicak-Man",
            "Number": 970,
            "Year": "2006",
            "Actor": "Aznil Hj Nawawi",
            "Role": "Professor Klon",
            "Rating": "5",
            "Genre 1": "Action",
            "Genre 2": "Comedy",
            "Genre 3": "Sci-Fi"
        },
        "467": {
            "Name": "Mexican Hayride",
            "Number": 972,
            "Year": "1948",
            "Actor": "Fritz Feld",
            "Role": "Professor Ganzmeyer",
            "Rating": "9",
            "Genre 1": "Comedy",
            "Genre 2": "Romance"
        },
        "468": {
            "Name": "The Age of Consent",
            "Number": 975,
            "Year": "1932",
            "Actor": "John Halliday",
            "Role": "Prof. David Mathews",
            "Rating": "4",
            "Genre 1": "Drama",
            "Genre 2": "Romance"
        },
        "469": {
            "Name": "A Trip to Mars",
            "Number": 979,
            "Year": "1918",
            "Actor": "Nicolai Neiiendam",
            "Role": "Prof. Planetaros - Astronomer",
            "Rating": "13",
            "Genre 1": "Adventure",
            "Genre 2": "Fantasy",
            "Genre 3": "Sci-Fi"
        },
        "470": {
            "Name": "A Trip to Mars",
            "Number": 979,
            "Year": "1918",
            "Actor": "Frederik Jacobsen",
            "Role": "Prof. Dubius",
            "Rating": "13",
            "Genre 1": "Adventure",
            "Genre 2": "Fantasy",
            "Genre 3": "Sci-Fi"
        },
        "471": {
            "Name": "Blondie Goes to College",
            "Number": 982,
            "Year": "1942",
            "Actor": "Harry C. Bradley",
            "Role": "Professor",
            "Rating": "1",
            "Genre 1": "Comedy"
        },
        "472": {
            "Name": "Delivered",
            "Number": 986,
            "Year": "1998",
            "Actor": "Jeff Steitzer",
            "Role": "Professor Freidman",
            "Rating": "NONE",
            "Genre 1": "Comedy",
            "Genre 2": "Drama",
            "Genre 3": "Thriller"
        },
        "473": {
            "Name": "Ramana",
            "Number": 990,
            "Year": "2002",
            "Actor": "Vijayakanth",
            "Role": "Prof. Ramana",
            "Rating": "NONE",
            "Genre 1": "Action",
            "Genre 2": "Drama"
        },
        "474": {
            "Name": "The Year That Trembled",
            "Number": 994,
            "Year": "2002",
            "Actor": "Matt Salinger",
            "Role": "Professor Jeff Griggs",
            "Rating": 34,
            "Genre 1": "Drama",
            "Genre 2": "Romance",
            "Genre 3": "War"
        },
        "475": {
            "Name": "Scialla! (Stai sereno)",
            "Number": 997,
            "Year": "2011",
            "Actor": "Fabrizio Bentivoglio",
            "Role": "Prof. Bruno Beltrame",
            "Rating": "NONE",
            "Genre 1": "Comedy"
        },
        "476": {
            "Name": "Scialla! (Stai sereno)",
            "Number": 997,
            "Year": "2011",
            "Actor": "Raffaella Lebboroni",
            "Role": "Prof.ssa Di Biagio",
            "Rating": "NONE",
            "Genre 1": "Comedy"
        }
    }
    

This is a list of all the movies which had professors, but did not name them explicitly in their credits, meaning they were not added to the above dictionary. There are quite a few, so we will deal with these in a bit.


```python
no_profs
```




    ['Little Women',
     'Avengers: Endgame',
     'Inception',
     'Harry Potter and the Goblet of Fire',
     'Chitty Chitty Bang Bang',
     'Indiana Jones and the Raiders of the Lost Ark',
     'Call Me by Your Name',
     'Black Christmas',
     'Man of Steel',
     'Murder on the Orient Express',
     'Ghostbusters',
     'Logan',
     'Fantastic Beasts: The Crimes of Grindelwald',
     'The Avengers',
     'Good Will Hunting',
     'A Simple Favor',
     'Doctor Zhivago',
     'Little Women',
     'The Man from U.N.C.L.E.',
     'Avengers: Age of Ultron',
     'The Da Vinci Code',
     'Arrival',
     'Antebellum',
     "Molly's Game",
     'Annihilation',
     'Thor',
     'The Imitation Game',
     'Spider-Man 3',
     'Shadowlands',
     'Lolita',
     "National Lampoon's Animal House",
     'Batman & Robin',
     'Transformers: The Last Knight',
     'Street Fighter',
     'The Theory of Everything',
     'Angels & Demons',
     'X: First Class',
     'Spider-Man 2',
     'Green Lantern',
     'Escape Room',
     'Enemy',
     'The Day After Tomorrow',
     'Ant-Man and the Wasp',
     'Independence Day',
     'Fantastic Four',
     'Ghostbusters: Answer the Call',
     'The Mummy',
     'The Meg',
     'Educating Rita',
     'North by Northwest',
     'Big Hero 6',
     'San Andreas',
     'Godzilla',
     'Dirty Grandpa',
     'Young Frankenstein',
     'Pacific Rim',
     'Definitely, Maybe',
     'The Royal Tenenbaums',
     'Shirley',
     'High Life',
     'Inside Llewyn Davis',
     'Dogville',
     'Bad Teacher',
     'Resident Evil: The Final Chapter',
     'Twins',
     'Time Trap',
     'The Adventures of Tintin',
     'A Serious Man',
     'Hellboy',
     'The Pacifier',
     'Terms of Endearment',
     'The Monuments Men',
     'The Nutty Professor',
     "Something's Gotta Give",
     'The Man from Earth',
     'Self/less',
     'Atlantis: The Lost Empire',
     'Journey to the Center of the Earth',
     'Downsizing',
     'As Above, So Below',
     'Transcendence',
     'Lost in Space',
     'A Single Man',
     'Altered States',
     'A River Runs Through It',
     'Mother',
     'The Mummy: Tomb of the Dragon Emperor',
     'The Body',
     'Night of the Living Dead',
     'Knowing',
     'Dawn of the Dead',
     'The Doors',
     'The Fisher King',
     'Flatliners',
     'Scanners',
     '21 Grams',
     'Wet Hot American Summer',
     'Café Society',
     'The Time Machine',
     'The Life of David Gale',
     'Anaconda',
     'What Lies Beneath',
     'Across the Universe',
     'The Wife',
     'Sneakers',
     'The Grudge',
     'The Rules of Attraction',
     'Dreamcatcher',
     'The Gambler',
     'Dead Ringers',
     'Mona Lisa Smile',
     'Forbidden Planet',
     'The Ghost Writer',
     '2010',
     'Holiday',
     'The Core',
     'Star Trek IV: The Voyage Home',
     'Wild Strawberries',
     'Wounds',
     'Still Alice',
     'The Pelican Brief',
     'Candy',
     'Breathe',
     'Dracula 2000',
     'Arachnophobia',
     'Igby Goes Down',
     'Lake Placid',
     'Wonder Boys',
     'Another Earth',
     'Nutty Professor II: The Klumps',
     'Shin Godzilla',
     'The Changeling',
     'Prince of Darkness',
     'In the Cut',
     'The Commune',
     "Who's Afraid of Virginia Woolf?",
     'Arlington Road',
     'Malicious',
     'The Andromeda Strain',
     'The Company You Keep',
     'Throw Momma from the Train',
     'The War of the Worlds',
     'Titan A.E.',
     'A Walk in the Clouds',
     'Memoirs of an Invisible Man',
     'In Her Shoes',
     'The Sea of Trees',
     'The Party',
     'The Children Act',
     'The Mirror Has Two Faces',
     'I Never Sang for My Father',
     'Les yeux sans visage',
     'Journey to the Center of the Earth',
     'The Freshman',
     'Dreamscape',
     'The Parallax View',
     'The Great Debaters',
     'The Experiment',
     'Wishmaster',
     'Left Behind: The Movie',
     'The Voyeur',
     'The Night Porter',
     'Ashfall',
     'Horror of Dracula',
     'The Photographer of Mauthausen',
     'Looking for Mr. Goodbar',
     'A Passage to India',
     'Planet 51',
     'Jailhouse Rock',
     '88 Minutes',
     'The Eiger Sanction',
     'The Ipcress File',
     'The Philadelphia Experiment',
     'Patient Zero',
     'With Honors',
     'Drumline',
     'Rebel in the Rye',
     'Gor',
     "He Knows You're Alone",
     'The China Syndrome',
     'Astro Boy',
     'Barking Dogs Never Bite',
     'Deadly Friend',
     'Indian Summer',
     'Koi no tsumi',
     'Thunderbirds',
     'The Savages',
     'Lost Horizon',
     'My Stepmother Is an Alien',
     'Support the Girls',
     'The Quiet American',
     'In the Garden of Beasts',
     'Spartan',
     'My Life in Ruins',
     'Phantoms',
     'Island of Terror',
     'The Lady Eve',
     'The Dunwich Horror',
     'To Live',
     'Black Sunday',
     'Some Kind of Beautiful',
     'The Boston Strangler',
     'Bad Timing',
     'Pumpkin',
     'The Paper Chase',
     'The Visitor',
     'My Mistress',
     'The Seeker: The Dark Is Rising',
     'Vagabond',
     'The Key',
     'Red Sky',
     'Husbands and Wives',
     'A Love Song for Bobby Long',
     'Evangelion: 1.0 You Are (Not) Alone',
     'While at War',
     'Pay the Ghost',
     'Cannibal Women in the Avocado Jungle of Death',
     'D.O.A.',
     'Yongseoneun eupda',
     "Mary and the Witch's Flower",
     'Criminal Law',
     'Feast of Love',
     'House of Games',
     'Saving Face',
     'One True Thing',
     'How About Adolf?',
     'Book of Blood',
     'Best Laid Plans',
     'The Red Pill',
     '2.0',
     'Diary of the Dead',
     'The Edge of Heaven',
     'Fantastic Fungi',
     'A Dry White Season',
     'Elegy',
     'The Devil Inside',
     'The Swan',
     'Rome, Open City',
     'Hit!',
     'Nightwish',
     'Like Father Like Son',
     'Suspect Zero',
     'Sssssss',
     "A Midsummer Night's Sex Comedy",
     'Equinox',
     'The Satanic Rites of Dracula',
     'A Change of Seasons',
     "What's in a Name?",
     'Cargo 200',
     'Scorpio',
     'Ship of Fools',
     'After the Storm',
     'Mr. Wonderful',
     'La tigre e la neve',
     'Baby: Secret of the Lost Legend',
     'Conversation Piece',
     'Pygmalion',
     'Burial Ground: The Nights of Terror',
     'The Woman in the Fifth',
     'The Gambler',
     'Storytelling',
     'The Sicilian',
     'The Swarm',
     'Anesthesia',
     'Good',
     'Voyage to the Bottom of the Sea',
     'Night School',
     'The Ages of Lulu',
     'The Brides of Dracula',
     'Nobel Son',
     'The Barbarian Invasions',
     "The Men's Club",
     'Diary of a Country Priest',
     'An Eye for an Eye',
     'Being Human',
     'The Dancer Upstairs',
     'Kissed',
     'The Lost World',
     'My Sex Life... or How I Got Into an Argument',
     'Thirteen Conversations About One Thing',
     'Creepy',
     'In Search of the Castaways',
     'Link',
     'The Day the Earth Caught Fire',
     'Godzilla 1985',
     'Cemetery of Terror',
     'Gabbar is Back',
     "Giornata nera per l'ariete",
     'Artists and Models',
     'Under the Sand',
     'Le divorce',
     'The Return of the Vampire',
     'The City of the Dead',
     'Nightflyers',
     "We Don't Live Here Anymore",
     'The Official Story',
     'The Crawling Eye',
     'The Reincarnation of Peter Proud',
     'Naked in New York',
     'Getting Straight',
     'The Call of Cthulhu',
     'In Darkness',
     'Like Someone in Love',
     'Music from Another Room',
     "Please Don't Eat the Daisies",
     'Hellbound',
     "Teacher's Pet",
     'Augustine',
     'Die Säge des Todes',
     'Baron Blood',
     'Strange Behavior',
     'Superman',
     'Godzilla: Planet of the Monsters',
     "Prendimi l'anima",
     'Above Suspicion',
     'Kiss Me Goodbye',
     'Captain Kronos: Vampire Hunter',
     'Howl',
     'Little Boxes',
     'Ararat',
     'Good Guys Wear Black',
     'New Best Friend',
     'Paper Heart',
     'The Plague of the Zombies',
     'Robot Monster',
     'The Powerpuff Girls Movie',
     'Cheerful Weather for the Wedding',
     'The Monster',
     'Bear Island',
     'The Girl with a Pistol',
     'Smart People',
     'Drive, He Said',
     'Southside with You',
     'Bug',
     'Boggy Creek II: And the Legend Continues',
     'Time Changer',
     'Five Graves to Cairo',
     'Vanya on 42nd Street',
     'Vénus noire',
     'Salvation Boulevard',
     'Make Mine Music',
     'Basil',
     'Sadako vs. Kayako',
     "Il y a longtemps que je t'aime",
     '13: Game of Death',
     'The Rosie Project',
     'The Star Maker',
     'Kardec',
     'Ripper',
     'Sensation',
     'Gojira: hoshi wo kû mono',
     "L'ultima orgia del III Reich",
     'The Color Out of Space',
     'The Whisperer in Darkness',
     'Zombie Holocaust',
     'Sweet Liberty',
     'Monster Island',
     'Helen',
     "Krippendorf's Tribe",
     'The People That Time Forgot',
     'Wolves',
     'Casshern',
     'Le Petit Soldat',
     'Verónica',
     'Cluny Brown',
     'Strange Interlude',
     'How to Drown Dr. Mracek, the Lawyer',
     'The Gorgeous Hussy',
     'Company Business',
     'Cat Run 2',
     'Open Window',
     'Merry Andrew',
     'Deadly Eyes',
     'Wetherby',
     'Spasms',
     'Patrick Still Lives',
     'The Homecoming',
     'The Hunting Ground',
     'Doctor X',
     'Beloved Sisters',
     'Up the Sandbox',
     'Gojira: kessen kidô zôshoku toshi',
     'Yeti: Giant of the 20th Century',
     'Baker County, U.S.A.',
     'Nico and Dani',
     'Out 1, noli me tangere',
     'Golden Rendezvous',
     'Hold Back the Dawn',
     'Burn, Witch, Burn',
     'Oleanna',
     'Warrior of the Lost World',
     'Abbott and Costello Meet the Mummy',
     'A Brief History of Time',
     'Casanova Brown',
     'The Feminine Touch',
     'Khiladi',
     'Nurse Sherri',
     'Danny Deckchair',
     'Getting Away with Murder',
     'Daens',
     'Yogen',
     'Young Törless',
     'Reincarnation',
     'Raaz',
     'Separate Lives',
     'Il mulino delle donne di pietra',
     'Big Jim McLain',
     'Chasing Sleep',
     "L'amour est un crime parfait",
     'Going Greek',
     'Edge of Darkness',
     'Bikini Med School',
     'Slaughterhouse Rock',
     'Privilege',
     'Five Weeks in a Balloon',
     'Norte, the End of History',
     'Les filles du botaniste',
     'Three Dancing Slaves',
     'The Formula',
     'Testament of Orpheus',
     'Breeders',
     'The Impossible Years',
     'O lyubvi',
     "Boys' Night Out",
     'The Sound of Fury',
     'On a volé la cuisse de Jupiter',
     'Pigskin Parade',
     'Man on the Train',
     'Les rendez-vous de Paris',
     'Hysterical',
     'Who Was That Lady?',
     'Afterimage',
     'Dangerous Moves',
     'Wild in the Country',
     'Death of a Cyclist',
     'Crack in the World',
     'Gross Misconduct',
     'The Transformation: A Sandwich of Nightmares',
     'Leo',
     'The H-Man',
     '205 - Zimmer der Angst',
     'Abby',
     'My Name Is Modesty: A Modesty Blaise Adventure',
     'The Phantom',
     'Norm of the North: King Sized Adventure',
     'Rattlers',
     'Leonie',
     "Eden's Curve",
     'The Adventures of Sadie',
     'The Lonely Passion of Judith Hearne',
     'Fai bei sogni',
     'Adam at Six A.M.',
     'Hotel Berlin',
     'The Frankenstein Theory',
     'Il profumo della signora in nero',
     'Make-Out with Violence',
     'American Desi',
     'Losing Ground',
     'Should a Schoolgirl Tell?',
     'Daria',
     'The Living Idol',
     'Travelling Salesman',
     "Le déjeuner sur l'herbe",
     "They Won't Forget",
     'Woman Wanted',
     'The Cherry Orchard',
     'No Regrets for Our Youth',
     'Hedda',
     'War of the Worlds: Goliath',
     'Blood Pi',
     'Mutluluk',
     'The Witchmaker',
     'The Ninth Day',
     'Shack Out on 101',
     'Manufacturing Consent: Noam Chomsky and the Media',
     'Ghost Warrior',
     "Charley's Aunt",
     'Telling You',
     'Arjun Pandit',
     'Love My Life',
     'Tooth and Nail',
     'Lovelife',
     'Lo scopone scientifico',
     'Final: The Rapture',
     'The Marriage-Go-Round',
     'Treasure of the Four Crowns',
     'Puccini for Beginners',
     'S&man',
     'An Occasional Hell',
     'Camouflage',
     'The Doctor Takes a Wife',
     'Forty Little Mothers',
     'The Children Are Watching Us',
     'Above Us Only Sky',
     'Controsesso',
     'The Killer of Dolls',
     'Starting Out in the Evening',
     "You'll Find Out",
     'The Ugly Swans',
     'Les témoins',
     'Messages Deleted',
     'Karisuma',
     'Obszönitäten',
     'Cut Off',
     'Les passagers',
     'Dugo ng birhen: El kapitan',
     'Eiga: minna! Esupâ da yo!',
     'Nés en 68',
     'Amore e morte nel giardino degli dei',
     'Liefling',
     'Dunia',
     'Nada',
     'Goke, Body Snatcher from Hell',
     'Spice It Up',
     'Noctem',
     'Simha',
     'Kucch To Hai',
     'Leader',
     'The Day It Came to Earth',
     "Witches' Brew",
     'Dvenadtsat mesyatsev',
     'Tous les soleils',
     'Time, the Fourth Dimension',
     'Primitif',
     'The Spies',
     'Sweet Love, Bitter',
     'Soldier of Fortune',
     'Theoretically, a paranoid conspiratorial phone call',
     "B.F.'s Daughter",
     'The Wild Party',
     'Man, Woman and Child',
     'Spettri',
     'Kodi',
     'Dulaara',
     'Undersea Kingdom',
     'Yeogyosu-ui eunmilhan maeryeok',
     'Student No. 1',
     'Vlastníci',
     'Agata and the Storm',
     'Edward, My Son',
     'Aflatoon',
     'Marriage a la Mode',
     'Brúðguminn',
     'Antonia.',
     'Years of the Beast',
     'Those Who Love Me Can Take the Train',
     'Modelar',
     'A Walk in the Spring Rain',
     'Dogwood Tree',
     'Druga strana svega',
     'The One',
     'Der Totmacher',
     'Chlap na strídacku',
     'Scorcher',
     'Butley',
     'Uncle Vanya',
     'Um Filme Falado',
     'Night of the Vampires',
     'Antonieta',
     'Sakura Killers',
     'Nammavar',
     'Shukujo wa nani o wasureta ka',
     'The Twonky',
     'Speed of Life',
     'Canavar Gibi',
     'Hatsujô kateikyôshi: Sensei no aijiru',
     'Pâkusu',
     'Doktor Faustus',
     "Getting Gertie's Garter",
     'Almost Normal',
     'Enter the Devil',
     'Body sob 19',
     'Kangwon-do ui him',
     'Run & Jump',
     'Spanish Fly',
     'She Went to the Races',
     'Dillagi',
     'Derakhte Golabi',
     'Mantra 2',
     'Suhagan',
     'Un nemico che ti vuole bene',
     '15 Park Avenue',
     'A Wife Confesses',
     'Nuits rouges',
     'The Blot',
     'Dai jui bou',
     'Insaaf',
     'Roda tsanta kai kopana',
     'Kabei: Our Mother',
     'Mazhayethum Munpe',
     'Wives Under Suspicion',
     'Pasolini, un delitto italiano',
     'Three Girls from Rome',
     'R.S.V.P.',
     'Notorious Gentleman',
     'Alimuom',
     'Fatal Pulse',
     'Altered Species',
     'The Young Lovers',
     'My Mother Frank',
     'Friends, Lovers, & Lunatics',
     'Zameer',
     'Chasing the Devil',
     'Meatcleaver Massacre',
     'Tsuma yo bara no yô ni: Kazoku wa tsuraiyo III',
     'Ambivalence',
     'Master',
     "That's My Boy",
     'On the Nose',
     'The Poker Club',
     'Robin Hood: Prince of Thieves',
     'Phool Aur Angaar',
     'Cadillac Girls',
     'Cthulhu',
     'The New Twenty',
     'Daredevils of the Red Circle',
     'The Blue Hour',
     'Floaty',
     'Muli',
     'Suite Dreams',
     'The Steagle',
     "The Emperor's Nightingale",
     'Sangram',
     'The Girl of the Golden West',
     'Sharafat',
     'A Witch Without a Broom',
     'The Seventh Room',
     'Urubú',
     'At kende sandheden',
     'Hide and Seek',
     'Kurôn wa kokyô wo mezasu',
     'Seeing Red',
     'Do I Sound Gay?']



We'll save the data as a json so we won't have to run the `create_data` function each time we start the kernel, because it takes quite a while, and will allow us to more easily manually inpuy new entries, which we will do with some of the movies that did not explicitly mention a professor in their credits.


```python
with open('data.json', 'w') as fp:
    json.dump(data, fp)
```

## Add some of the missing movies
As we saw above, there are a good amount of movies that did not explictly mention professors that are not accounted for in our data. 633 movies in fact, more than half of the movies we looked at. 


```python
len(no_profs)
```




    633



It would be extremely difficult to find and add all these movies to our data, since it would require some context of the movie's plot to recognize which characters are indeed professors. So I will select 30 random movies from the `no_profs` list to research and add to the list, favoring movies higher up on the list, since these movies are more well-known. 


```python
import random
def rand(min_, max_):
    result = min_ + (max_ - min_) * pow(random.random(), 4)
    return int(result)
```


```python
import numpy as np
addMovies = []
while len(addMovies) < 30:
    mov = rand(0,len(no_profs))
    if mov in addMovies:
        continue
    else: 
        addMovies.append(mov)
addMovies = np.asarray(addMovies)
addMovies
```




    array([ 19,  27,   7, 340,   9,   5,   2,   0, 533,   1,  16, 488,   4,
            21,  57,  31, 614, 607,  41, 197,  28, 617, 332,  88,  54,  26,
            79,  32, 163, 162])




```python
hi = np.asarray(no_profs)
hi[addMovies]
```




    array(['Avengers: Age of Ultron', 'Spider-Man 3', 'Black Christmas',
           'Make Mine Music', 'Murder on the Orient Express',
           'Indiana Jones and the Raiders of the Lost Ark', 'Inception',
           'Little Women', 'Dulaara', 'Avengers: Endgame', 'Doctor Zhivago',
           'An Occasional Hell', 'Chitty Chitty Bang Bang', 'Arrival',
           'The Royal Tenenbaums', 'Batman & Robin', 'The New Twenty',
           "That's My Boy", 'The Day After Tomorrow', 'The Dunwich Horror',
           'Shadowlands', 'Floaty', 'Southside with You',
           'Night of the Living Dead', 'Young Frankenstein',
           'The Imitation Game', 'As Above, So Below',
           'Transformers: The Last Knight', 'Horror of Dracula', 'Ashfall'],
          dtype='<U51')



I manually edited the json to add these movies, since it was easier that way

## Determining Gender
The simplelist demographic to analyze and compare is gender. I will determine the gender by analyzing the first names of the actors in the data dictionary. The list of male and female names is courtesy of geeksforgeeks.org. Now, in order to avoid miscoding names, there is some overlap between male and female names. 

If a name is present in both of the lists, the `determine_gender` function will code the actor as `Both`. Then, I will manually go through and determine the gender of the actor. If the actor's name is not in either list, the function will classify it as `Unknown` and will similarly manually classify these actors.


```python
#load raw texts of lists
male = requests.get("https://media.geeksforgeeks.org/wp-content/uploads/male.txt").text.split("\n")
female = requests.get("https://media.geeksforgeeks.org/wp-content/uploads/female.txt").text.split("\n")
```


```python
def determine_gender(name):
    """
    takes in a name and outputs a gender by searching through the male and female lists
    """
    try:
        name = name.split()[0]
    except IndexError:
        return None
    name = name[0].upper() + name[1:]
    if name in male and name in female:
        return "Both"
    elif name in male:
        return "Male"
    elif name in female:
        return "Female"
    else:
        return "Unknown"
```


```python
determine_gender("Lawrence Parks")
```




    'Male'




```python
determine_gender("Carrie Fisher")
```




    'Female'




```python
determine_gender("Angie Smith")
```




    'Both'




```python
determine_gender("Anze Kopitar")
```




    'Unknown'



## Cleaning Data
We will now convert the json formatted data into a `pandas` data frame, making the data much more accessible for analysis and for manipulation


```python
import pandas as pd
```


```python
df = pd.read_json("data.json")
df = df.transpose()
df
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Name</th>
      <th>Number</th>
      <th>Year</th>
      <th>Actor</th>
      <th>Role</th>
      <th>Rating</th>
      <th>Genre 1</th>
      <th>Genre 2</th>
      <th>Genre 3</th>
      <th>Genre 4</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Harry Potter and the Sorcerer's Stone</td>
      <td>0</td>
      <td>2001</td>
      <td>Maggie Smith</td>
      <td>Professor McGonagall</td>
      <td>64</td>
      <td>Adventure</td>
      <td>Family</td>
      <td>Fantasy</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Harry Potter and the Sorcerer's Stone</td>
      <td>0</td>
      <td>2001</td>
      <td>Ian Hart</td>
      <td>Professor Quirrell</td>
      <td>64</td>
      <td>Adventure</td>
      <td>Family</td>
      <td>Fantasy</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Harry Potter and the Sorcerer's Stone</td>
      <td>0</td>
      <td>2001</td>
      <td>Alan Rickman</td>
      <td>Professor Snape</td>
      <td>64</td>
      <td>Adventure</td>
      <td>Family</td>
      <td>Fantasy</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Interstellar</td>
      <td>3</td>
      <td>2014</td>
      <td>Michael Caine</td>
      <td>Professor Brand</td>
      <td>74</td>
      <td>Adventure</td>
      <td>Drama</td>
      <td>Sci-Fi</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>4</th>
      <td>The Wizard of Oz</td>
      <td>5</td>
      <td>1939</td>
      <td>Frank Morgan</td>
      <td>Professor Marvel</td>
      <td>92</td>
      <td>Adventure</td>
      <td>Family</td>
      <td>Fantasy</td>
      <td>Musical</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>472</th>
      <td>Delivered</td>
      <td>986</td>
      <td>1998</td>
      <td>Jeff Steitzer</td>
      <td>Professor Freidman</td>
      <td>NONE</td>
      <td>Comedy</td>
      <td>Drama</td>
      <td>Thriller</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>473</th>
      <td>Ramana</td>
      <td>990</td>
      <td>2002</td>
      <td>Vijayakanth</td>
      <td>Prof. Ramana</td>
      <td>NONE</td>
      <td>Action</td>
      <td>Drama</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>474</th>
      <td>The Year That Trembled</td>
      <td>994</td>
      <td>2002</td>
      <td>Matt Salinger</td>
      <td>Professor Jeff Griggs</td>
      <td>34</td>
      <td>Drama</td>
      <td>Romance</td>
      <td>War</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>475</th>
      <td>Scialla! (Stai sereno)</td>
      <td>997</td>
      <td>2011</td>
      <td>Fabrizio Bentivoglio</td>
      <td>Prof. Bruno Beltrame</td>
      <td>NONE</td>
      <td>Comedy</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>476</th>
      <td>Scialla! (Stai sereno)</td>
      <td>997</td>
      <td>2011</td>
      <td>Raffaella Lebboroni</td>
      <td>Prof.ssa Di Biagio</td>
      <td>NONE</td>
      <td>Comedy</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
    </tr>
  </tbody>
</table>
<p>477 rows × 10 columns</p>
</div>



Most of the movies do not have a third or fourth gender, so we will just remove those


```python
df = df.drop(["Genre 3","Genre 4"], axis = 1 )
df
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Name</th>
      <th>Number</th>
      <th>Year</th>
      <th>Actor</th>
      <th>Role</th>
      <th>Rating</th>
      <th>Genre 1</th>
      <th>Genre 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Harry Potter and the Sorcerer's Stone</td>
      <td>0</td>
      <td>2001</td>
      <td>Maggie Smith</td>
      <td>Professor McGonagall</td>
      <td>64</td>
      <td>Adventure</td>
      <td>Family</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Harry Potter and the Sorcerer's Stone</td>
      <td>0</td>
      <td>2001</td>
      <td>Ian Hart</td>
      <td>Professor Quirrell</td>
      <td>64</td>
      <td>Adventure</td>
      <td>Family</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Harry Potter and the Sorcerer's Stone</td>
      <td>0</td>
      <td>2001</td>
      <td>Alan Rickman</td>
      <td>Professor Snape</td>
      <td>64</td>
      <td>Adventure</td>
      <td>Family</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Interstellar</td>
      <td>3</td>
      <td>2014</td>
      <td>Michael Caine</td>
      <td>Professor Brand</td>
      <td>74</td>
      <td>Adventure</td>
      <td>Drama</td>
    </tr>
    <tr>
      <th>4</th>
      <td>The Wizard of Oz</td>
      <td>5</td>
      <td>1939</td>
      <td>Frank Morgan</td>
      <td>Professor Marvel</td>
      <td>92</td>
      <td>Adventure</td>
      <td>Family</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>472</th>
      <td>Delivered</td>
      <td>986</td>
      <td>1998</td>
      <td>Jeff Steitzer</td>
      <td>Professor Freidman</td>
      <td>NONE</td>
      <td>Comedy</td>
      <td>Drama</td>
    </tr>
    <tr>
      <th>473</th>
      <td>Ramana</td>
      <td>990</td>
      <td>2002</td>
      <td>Vijayakanth</td>
      <td>Prof. Ramana</td>
      <td>NONE</td>
      <td>Action</td>
      <td>Drama</td>
    </tr>
    <tr>
      <th>474</th>
      <td>The Year That Trembled</td>
      <td>994</td>
      <td>2002</td>
      <td>Matt Salinger</td>
      <td>Professor Jeff Griggs</td>
      <td>34</td>
      <td>Drama</td>
      <td>Romance</td>
    </tr>
    <tr>
      <th>475</th>
      <td>Scialla! (Stai sereno)</td>
      <td>997</td>
      <td>2011</td>
      <td>Fabrizio Bentivoglio</td>
      <td>Prof. Bruno Beltrame</td>
      <td>NONE</td>
      <td>Comedy</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>476</th>
      <td>Scialla! (Stai sereno)</td>
      <td>997</td>
      <td>2011</td>
      <td>Raffaella Lebboroni</td>
      <td>Prof.ssa Di Biagio</td>
      <td>NONE</td>
      <td>Comedy</td>
      <td>NaN</td>
    </tr>
  </tbody>
</table>
<p>477 rows × 8 columns</p>
</div>



Next, we will apply our `determine_gender` function to the actors in the data frame and store the gender in a new column called "Gender."


```python
df_gender = df.copy()
df_gender["Gender"] = df_gender["Actor"].apply(determine_gender)
df_gender
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Name</th>
      <th>Number</th>
      <th>Year</th>
      <th>Actor</th>
      <th>Role</th>
      <th>Rating</th>
      <th>Genre 1</th>
      <th>Genre 2</th>
      <th>Gender</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Harry Potter and the Sorcerer's Stone</td>
      <td>0</td>
      <td>2001</td>
      <td>Maggie Smith</td>
      <td>Professor McGonagall</td>
      <td>64</td>
      <td>Adventure</td>
      <td>Family</td>
      <td>Female</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Harry Potter and the Sorcerer's Stone</td>
      <td>0</td>
      <td>2001</td>
      <td>Ian Hart</td>
      <td>Professor Quirrell</td>
      <td>64</td>
      <td>Adventure</td>
      <td>Family</td>
      <td>Male</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Harry Potter and the Sorcerer's Stone</td>
      <td>0</td>
      <td>2001</td>
      <td>Alan Rickman</td>
      <td>Professor Snape</td>
      <td>64</td>
      <td>Adventure</td>
      <td>Family</td>
      <td>Male</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Interstellar</td>
      <td>3</td>
      <td>2014</td>
      <td>Michael Caine</td>
      <td>Professor Brand</td>
      <td>74</td>
      <td>Adventure</td>
      <td>Drama</td>
      <td>Male</td>
    </tr>
    <tr>
      <th>4</th>
      <td>The Wizard of Oz</td>
      <td>5</td>
      <td>1939</td>
      <td>Frank Morgan</td>
      <td>Professor Marvel</td>
      <td>92</td>
      <td>Adventure</td>
      <td>Family</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>472</th>
      <td>Delivered</td>
      <td>986</td>
      <td>1998</td>
      <td>Jeff Steitzer</td>
      <td>Professor Freidman</td>
      <td>NONE</td>
      <td>Comedy</td>
      <td>Drama</td>
      <td>Male</td>
    </tr>
    <tr>
      <th>473</th>
      <td>Ramana</td>
      <td>990</td>
      <td>2002</td>
      <td>Vijayakanth</td>
      <td>Prof. Ramana</td>
      <td>NONE</td>
      <td>Action</td>
      <td>Drama</td>
      <td>Unknown</td>
    </tr>
    <tr>
      <th>474</th>
      <td>The Year That Trembled</td>
      <td>994</td>
      <td>2002</td>
      <td>Matt Salinger</td>
      <td>Professor Jeff Griggs</td>
      <td>34</td>
      <td>Drama</td>
      <td>Romance</td>
      <td>Male</td>
    </tr>
    <tr>
      <th>475</th>
      <td>Scialla! (Stai sereno)</td>
      <td>997</td>
      <td>2011</td>
      <td>Fabrizio Bentivoglio</td>
      <td>Prof. Bruno Beltrame</td>
      <td>NONE</td>
      <td>Comedy</td>
      <td>NaN</td>
      <td>Unknown</td>
    </tr>
    <tr>
      <th>476</th>
      <td>Scialla! (Stai sereno)</td>
      <td>997</td>
      <td>2011</td>
      <td>Raffaella Lebboroni</td>
      <td>Prof.ssa Di Biagio</td>
      <td>NONE</td>
      <td>Comedy</td>
      <td>NaN</td>
      <td>Unknown</td>
    </tr>
  </tbody>
</table>
<p>477 rows × 9 columns</p>
</div>



Let's see how many of each category (Male, Female, Both, and Unknown) we have at the moment.


```python
df_gender.groupby("Gender")[["Role"]].count()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Role</th>
    </tr>
    <tr>
      <th>Gender</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>Both</th>
      <td>57</td>
    </tr>
    <tr>
      <th>Female</th>
      <td>37</td>
    </tr>
    <tr>
      <th>Male</th>
      <td>283</td>
    </tr>
    <tr>
      <th>Unknown</th>
      <td>100</td>
    </tr>
  </tbody>
</table>
</div>



It looks like we will have about 157 entries to correct. Let's take a look at those classifed as "Both."


```python
df_gender[df_gender["Gender"] == "Both"]
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Name</th>
      <th>Number</th>
      <th>Year</th>
      <th>Actor</th>
      <th>Role</th>
      <th>Rating</th>
      <th>Genre 1</th>
      <th>Genre 2</th>
      <th>Gender</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>4</th>
      <td>The Wizard of Oz</td>
      <td>5</td>
      <td>1939</td>
      <td>Frank Morgan</td>
      <td>Professor Marvel</td>
      <td>92</td>
      <td>Adventure</td>
      <td>Family</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>29</th>
      <td>Indiana Jones and the Last Crusade</td>
      <td>19</td>
      <td>1989</td>
      <td>Sean Connery</td>
      <td>Professor Henry Jones</td>
      <td>65</td>
      <td>Action</td>
      <td>Adventure</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>30</th>
      <td>Indiana Jones and the Last Crusade</td>
      <td>19</td>
      <td>1989</td>
      <td>Jerry Harte</td>
      <td>Professor Stanton</td>
      <td>65</td>
      <td>Action</td>
      <td>Adventure</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>32</th>
      <td>Fast &amp; Furious Presents: Hobbs &amp; Shaw</td>
      <td>24</td>
      <td>2019</td>
      <td>Eddie Marsan</td>
      <td>Professor Andreiko</td>
      <td>60</td>
      <td>Action</td>
      <td>Adventure</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>33</th>
      <td>The Italian Job</td>
      <td>31</td>
      <td>1969</td>
      <td>Benny Hill</td>
      <td>Professor Simon Peach</td>
      <td>70</td>
      <td>Action</td>
      <td>Comedy</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>40</th>
      <td>Lucy</td>
      <td>50</td>
      <td>2014</td>
      <td>Morgan Freeman</td>
      <td>Professor Norman</td>
      <td>61</td>
      <td>Action</td>
      <td>Sci-Fi</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>47</th>
      <td>Downfall</td>
      <td>66</td>
      <td>2004</td>
      <td>Christian Berkel</td>
      <td>Prof. Ernst-Günther Schenck</td>
      <td>82</td>
      <td>Biography</td>
      <td>Drama</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>78</th>
      <td>Tolkien</td>
      <td>113</td>
      <td>2019</td>
      <td>Andy Orchard</td>
      <td>Professor #2</td>
      <td>48</td>
      <td>Biography</td>
      <td>Drama</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>79</th>
      <td>Timeline</td>
      <td>117</td>
      <td>2003</td>
      <td>Billy Connolly</td>
      <td>Professor Johnston</td>
      <td>28</td>
      <td>Action</td>
      <td>Adventure</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>80</th>
      <td>Scary Movie 2</td>
      <td>119</td>
      <td>2001</td>
      <td>Tim Curry</td>
      <td>Professor</td>
      <td>29</td>
      <td>Comedy</td>
      <td>Horror</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>81</th>
      <td>Fallen</td>
      <td>121</td>
      <td>1998</td>
      <td>Christian Aubert</td>
      <td>Professor Louders</td>
      <td>65</td>
      <td>Action</td>
      <td>Crime</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>86</th>
      <td>Ghost Stories</td>
      <td>133</td>
      <td>2017</td>
      <td>Andy Nyman</td>
      <td>Professor Goodman</td>
      <td>68</td>
      <td>Drama</td>
      <td>Horror</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>90</th>
      <td>Back to School</td>
      <td>147</td>
      <td>1986</td>
      <td>Sam Kinison</td>
      <td>Professor Terguson</td>
      <td>68</td>
      <td>Comedy</td>
      <td>Romance</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>113</th>
      <td>The Red Shoes</td>
      <td>189</td>
      <td>1948</td>
      <td>Austin Trevor</td>
      <td>Professor Palmer</td>
      <td>116</td>
      <td>Drama</td>
      <td>Music</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>114</th>
      <td>The Day the Earth Stood Still</td>
      <td>196</td>
      <td>1951</td>
      <td>Sam Jaffe</td>
      <td>Professor Jacob Barnhardt</td>
      <td>136</td>
      <td>Drama</td>
      <td>Sci-Fi</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>118</th>
      <td>On the Town</td>
      <td>206</td>
      <td>1949</td>
      <td>George Meader</td>
      <td>Professor</td>
      <td>71</td>
      <td>Comedy</td>
      <td>Musical</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>119</th>
      <td>Funny Face</td>
      <td>207</td>
      <td>1957</td>
      <td>Michel Auclair</td>
      <td>Prof. Emile Flostre</td>
      <td>84</td>
      <td>Comedy</td>
      <td>Musical</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>121</th>
      <td>The Roommate</td>
      <td>209</td>
      <td>2011</td>
      <td>Billy Zane</td>
      <td>Professor Roberts</td>
      <td>23</td>
      <td>Thriller</td>
      <td>NaN</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>129</th>
      <td>Flubber</td>
      <td>222</td>
      <td>1997</td>
      <td>Robin Williams</td>
      <td>Professor Philip Brainard</td>
      <td>37</td>
      <td>Comedy</td>
      <td>Family</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>159</th>
      <td>The Fantastic Four</td>
      <td>286</td>
      <td>1994</td>
      <td>George Gaynes</td>
      <td>Professor</td>
      <td>59</td>
      <td>Action</td>
      <td>Adventure</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>160</th>
      <td>Little Nemo: Adventures in Slumberland</td>
      <td>291</td>
      <td>1989</td>
      <td>Rene Auberjonois</td>
      <td>Professor Genius</td>
      <td>25</td>
      <td>Animation</td>
      <td>Adventure</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>161</th>
      <td>Going the Distance</td>
      <td>292</td>
      <td>2010</td>
      <td>Terry Beaver</td>
      <td>Professor</td>
      <td>51</td>
      <td>Comedy</td>
      <td>Romance</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>170</th>
      <td>The Best of Youth</td>
      <td>301</td>
      <td>2003</td>
      <td>Michele Melega</td>
      <td>Professore di Lettere</td>
      <td>89</td>
      <td>Drama</td>
      <td>Romance</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>171</th>
      <td>The Nutty Professor</td>
      <td>303</td>
      <td>1963</td>
      <td>Jerry Lewis</td>
      <td>Prof. Julius Kelp</td>
      <td>56</td>
      <td>Comedy</td>
      <td>Romance</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>179</th>
      <td>Ball of Fire</td>
      <td>304</td>
      <td>1941</td>
      <td>Aubrey Mather</td>
      <td>Prof. Peagram</td>
      <td>78</td>
      <td>Comedy</td>
      <td>Romance</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>190</th>
      <td>Teen Wolf Too</td>
      <td>331</td>
      <td>1987</td>
      <td>Kim Darby</td>
      <td>Professor Brooks</td>
      <td>8</td>
      <td>Comedy</td>
      <td>Fantasy</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>205</th>
      <td>The Fourth Protocol</td>
      <td>369</td>
      <td>1987</td>
      <td>Jerry Harte</td>
      <td>Professor Krilov</td>
      <td>64</td>
      <td>Thriller</td>
      <td>NaN</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>212</th>
      <td>The Absent Minded Professor</td>
      <td>386</td>
      <td>1961</td>
      <td>Fred MacMurray</td>
      <td>Professor Ned Brainard</td>
      <td>75</td>
      <td>Comedy</td>
      <td>Family</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>231</th>
      <td>The Mortal Storm</td>
      <td>437</td>
      <td>1940</td>
      <td>Frank Morgan</td>
      <td>Professor Viktor Roth</td>
      <td>32</td>
      <td>Drama</td>
      <td>NaN</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>237</th>
      <td>The Lost World</td>
      <td>444</td>
      <td>1960</td>
      <td>Claude Rains</td>
      <td>Prof. George Edward Challenger</td>
      <td>48</td>
      <td>Adventure</td>
      <td>Fantasy</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>247</th>
      <td>Tall Story</td>
      <td>459</td>
      <td>1960</td>
      <td>Ray Walston</td>
      <td>Prof. Leo Sullivan</td>
      <td>9</td>
      <td>Comedy</td>
      <td>Sport</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>250</th>
      <td>The Landlord</td>
      <td>467</td>
      <td>1970</td>
      <td>Mel Stewart</td>
      <td>Professor Duboise</td>
      <td>75</td>
      <td>Comedy</td>
      <td>Drama</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>267</th>
      <td>Son of Flubber</td>
      <td>506</td>
      <td>1963</td>
      <td>Fred MacMurray</td>
      <td>Prof. Ned Brainard</td>
      <td>13</td>
      <td>Comedy</td>
      <td>Sci-Fi</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>269</th>
      <td>Rivelazioni di un maniaco sessuale al capo del...</td>
      <td>507</td>
      <td>1972</td>
      <td>Chris Avram</td>
      <td>Professor Casali</td>
      <td>32</td>
      <td>Crime</td>
      <td>Drama</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>298</th>
      <td>That Man from Rio</td>
      <td>560</td>
      <td>1964</td>
      <td>Jean Servais</td>
      <td>Prof. Norbert Catalan</td>
      <td>30</td>
      <td>Action</td>
      <td>Adventure</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>308</th>
      <td>Shark</td>
      <td>581</td>
      <td>1969</td>
      <td>Barry Sullivan</td>
      <td>Prof. Dan Mallare</td>
      <td>24</td>
      <td>Action</td>
      <td>Adventure</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>315</th>
      <td>12:08 East of Bucharest</td>
      <td>595</td>
      <td>2006</td>
      <td>Daniel Badale</td>
      <td>Professor</td>
      <td>77</td>
      <td>Comedy</td>
      <td>Drama</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>338</th>
      <td>Margie</td>
      <td>653</td>
      <td>1946</td>
      <td>Glenn Langan</td>
      <td>Prof. Ralph Fontayne</td>
      <td>5</td>
      <td>Comedy</td>
      <td>Music</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>340</th>
      <td>'Pimpernel' Smith</td>
      <td>661</td>
      <td>1941</td>
      <td>Leslie Howard</td>
      <td>Professor Horatio Smith</td>
      <td>8</td>
      <td>Adventure</td>
      <td>Drama</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>342</th>
      <td>Konga</td>
      <td>667</td>
      <td>1961</td>
      <td>George Pastell</td>
      <td>Professor Tagore</td>
      <td>54</td>
      <td>Horror</td>
      <td>Sci-Fi</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>354</th>
      <td>The Return of Count Yorga</td>
      <td>698</td>
      <td>1971</td>
      <td>George Macready</td>
      <td>Prof. Rightstat</td>
      <td>44</td>
      <td>Horror</td>
      <td>NaN</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>361</th>
      <td>Bathing Beauty</td>
      <td>715</td>
      <td>1944</td>
      <td>Bill Goodwin</td>
      <td>Professor Willis Evans</td>
      <td>11</td>
      <td>Comedy</td>
      <td>Musical</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>362</th>
      <td>Bathing Beauty</td>
      <td>715</td>
      <td>1944</td>
      <td>Francis Pierlot</td>
      <td>Professor Hendricks</td>
      <td>11</td>
      <td>Comedy</td>
      <td>Musical</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>368</th>
      <td>Death Tunnel</td>
      <td>722</td>
      <td>2005</td>
      <td>Gill Gayle</td>
      <td>Professor</td>
      <td>35</td>
      <td>Horror</td>
      <td>NaN</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>376</th>
      <td>The Mummy's Ghost</td>
      <td>749</td>
      <td>1944</td>
      <td>Frank Reicher</td>
      <td>Professor Norman</td>
      <td>44</td>
      <td>Fantasy</td>
      <td>Horror</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>389</th>
      <td>Mother Is a Freshman</td>
      <td>772</td>
      <td>1949</td>
      <td>Van Johnson</td>
      <td>Professor Richard Michaels</td>
      <td>5</td>
      <td>Comedy</td>
      <td>Romance</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>395</th>
      <td>Battle of the Worlds</td>
      <td>789</td>
      <td>1961</td>
      <td>Claude Rains</td>
      <td>Prof. Benson</td>
      <td>22</td>
      <td>Horror</td>
      <td>Sci-Fi</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>398</th>
      <td>It Happens Every Spring</td>
      <td>797</td>
      <td>1949</td>
      <td>Ray Milland</td>
      <td>Prof. Vernon K. Simpson</td>
      <td>14</td>
      <td>Comedy</td>
      <td>Sci-Fi</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>399</th>
      <td>It Happens Every Spring</td>
      <td>797</td>
      <td>1949</td>
      <td>Ray Collins</td>
      <td>Prof. Alfred Greenleaf</td>
      <td>14</td>
      <td>Comedy</td>
      <td>Sci-Fi</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>419</th>
      <td>Mara and the Firebringer</td>
      <td>839</td>
      <td>2015</td>
      <td>Jan Josef Liefers</td>
      <td>Professor Weissinger</td>
      <td>35</td>
      <td>Drama</td>
      <td>Fantasy</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>427</th>
      <td>Invitation</td>
      <td>862</td>
      <td>1952</td>
      <td>Alex Gerry</td>
      <td>Professor Redwick</td>
      <td>NONE</td>
      <td>Drama</td>
      <td>Romance</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>431</th>
      <td>Love and Other Catastrophes</td>
      <td>871</td>
      <td>1996</td>
      <td>Kim Gyngell</td>
      <td>Professor Richard Leach</td>
      <td>58</td>
      <td>Comedy</td>
      <td>Romance</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>439</th>
      <td>His Brother's Wife</td>
      <td>896</td>
      <td>1936</td>
      <td>Jean Hersholt</td>
      <td>Professor Fahrenheim</td>
      <td>1</td>
      <td>Drama</td>
      <td>Romance</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>446</th>
      <td>Up and Down</td>
      <td>919</td>
      <td>2004</td>
      <td>Jan Tríska</td>
      <td>Professor Otakar Horecký</td>
      <td>78</td>
      <td>Comedy</td>
      <td>Drama</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>457</th>
      <td>The Return of October</td>
      <td>943</td>
      <td>1948</td>
      <td>Glenn Ford</td>
      <td>Prof. Bentley 'Bass' Bassett Jr.</td>
      <td>5</td>
      <td>Comedy</td>
      <td>Drama</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>459</th>
      <td>Good News</td>
      <td>947</td>
      <td>1930</td>
      <td>Frank McGlynn Sr.</td>
      <td>Prof. Kenyon</td>
      <td>2</td>
      <td>Comedy</td>
      <td>Musical</td>
      <td>Both</td>
    </tr>
    <tr>
      <th>461</th>
      <td>College Girls</td>
      <td>951</td>
      <td>1968</td>
      <td>Sean O'Hara</td>
      <td>Professor Bryce</td>
      <td>3</td>
      <td>Comedy</td>
      <td>NaN</td>
      <td>Both</td>
    </tr>
  </tbody>
</table>
</div>



I am familiar with many of these actors, so I will change their entry from "Both" to "Male." For those who I was not familiar with, I researched them indivudally and changed their Gender accordingly.


```python
changers2 = [19,24,41,43,54,471,475,478,481]
for i in changes:
    if i in [229,276]:
        hi.loc[i]["Gender"] = "Female"
        continue
    elif i in [256,257,402]:
        continue
    hi.loc[i]["Gender"] = "Male"
```


```python
hi.groupby("Gender")["Name"].count().plot(kind="bar").set_ylabel("Frequency")
```




    Text(0, 0.5, 'Frequency')




    
![png](Professor%20Project_files/Professor%20Project_51_1.png)
    



```python
from matplotlib import pyplot as plt
import seaborn as sns
import numpy as np
sns.set()
```


```python
by_year = hi.groupby(["Gender","Year"])[["Actor"]].count()
fig, ax = plt.subplots(2, 2, figsize = (20,10))


ax[0,0].plot(by_year.loc["Female"].index.get_level_values(0), by_year.loc["Female"].cumsum(), c = "Orange")
ax[0,0].set(xlabel = "Years", ylabel = "Frequency", title = "Total Female Professors")

ax[0,1].plot(by_year.loc["Female"].index.get_level_values(0), by_year.loc["Female"], c = "Orange")
ax[0,1].set(xlabel = "Years", ylabel = "Frequency", title = "Female Professors per year")

ax[1,0].plot(by_year.loc["Male"].index.get_level_values(0), by_year.loc["Male"].cumsum(), c = "Purple")
ax[1,0].set(xlabel = "Years", ylabel = "Frequency", title = "Total Male Professors",)

ax[1,1].plot(by_year.loc["Male"].index.get_level_values(0), by_year.loc["Male"], c = "Purple")
ax[1,1].set(xlabel = "Years", ylabel = "Frequency", title = "Male Professors per year")
fig.show()

fig, ax = plt.subplots(2, figsize=(10,12))
ax[0].plot(by_year.loc["Male"].index.get_level_values(0), by_year.loc["Male"].cumsum(), c = "Purple", label = "Male")
ax[0].plot(by_year.loc["Female"].index.get_level_values(0), by_year.loc["Female"].cumsum(), c = "Orange", label = "Female")
ax[0].legend()
ax[0].set(xlabel = "Years", ylabel = "Frequency", title = "Total number of Professors")

ax[1].plot(by_year.loc["Male"].index.get_level_values(0), by_year.loc["Male"], c = "Purple", label = "Male")
ax[1].plot(by_year.loc["Female"].index.get_level_values(0), by_year.loc["Female"], c = "Orange", label = "Female")
ax[1].legend()
ax[1].set(xlabel = "Years", ylabel = "Frequency", title = "Professors per Year")
fig.show()
```

    <ipython-input-15-7f8e4f973caf>:16: UserWarning: Matplotlib is currently using module://ipykernel.pylab.backend_inline, which is a non-GUI backend, so cannot show the figure.
      fig.show()
    <ipython-input-15-7f8e4f973caf>:28: UserWarning: Matplotlib is currently using module://ipykernel.pylab.backend_inline, which is a non-GUI backend, so cannot show the figure.
      fig.show()
    


    
![png](Professor%20Project_files/Professor%20Project_53_1.png)
    



    
![png](Professor%20Project_files/Professor%20Project_53_2.png)
    

