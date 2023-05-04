# This R code reads Google sheet from a table provided by N2 Civil Team for monitoring Viaduct construction
# The source of URL: "https://docs.google.com/spreadsheets/d/11NMBpr1nKXuOgooHDl-CARvrieVN7VjEpLM1XgNwR0c/edit#gid=499307998&fvid=1497289736"
# 
# I copied the Google Sheet using IMPORTRANGE and created a copied Google SHeet (i.e., replica of the source)
# but with only necessary information
# GIS URL: "https://docs.google.com/spreadsheets/d/11YqYaenIB0l3Bpiv398-0QO3mEIR_BjvnMIsIOF3ILI/edit#gid=0"
# 
# OPERATION STEPS:
# 1. Read the Google Sheet
# 2. Restructure the data set
# 3. Join the table to our master list table
# 4. Export

# MAKE SURE THAT Type of Viaduct in Domain of ArcGIS Pro follows this:
# Bored Pile = 1
# Pile Cap = 2
# Pier Column = 3
# Pier Head = 4
# Precast = 5

# MAKE SURE THAT Status1 of Viaduct in Domain of ArcGIS Pro follows this:
# To be Constructed = 1
# Under Construction = 2
# Delayed = 3
# Completed = 4


library(googlesheets4)
library(openxlsx)
library(dplyr)
library(googledrive)
library(stringr)
library(reshape2)
library(fs)
library(lubridate)
library(rrapply)
library(purrr)

####################################################################
### 0: PRELIMINARY WORK----
## Please run the following code when nPierNumber needs to be re-assigned

## Make sure that nPierNumber follows the format of each site planner from N-01 to N-04
aa = file.choose()
x = read.xlsx(aa)

x$pp2 = as.character(x$pp2)

id = which(x$pp<10)
x$pp2[id] = paste("0",x$pp[id],sep="")

## N-01 ##
# e.g., P24A, P24B,  (A and B is pile number)
id = which(x$CP=="N-01")
x$nPierNumber[id] = x$PierNumber[id]
x$nPierNumber[id] = gsub("-","",x$nPierNumber[id])


pierLetter = c("A","B","C","D","E","F","G","H","I","J","K","L")
upp = unique(x$pp[id])
upp = upp[!is.na(upp)]

head(x)
for(i in upp){
  id = which(x$CP=="N-01" & x$pp==i)
  x$nPierNumber[id] = paste(x$nPierNumber[id],pierLetter[i],sep="")
}

## N-02 ##
# e.g., P429-P01, P429-P02 (P01 and P02 are pile numbers)
id = which(x$CP=="N-02")
x$nPierNumber[id] = x$PierNumber[id]
x$nPierNumber[id] = gsub("-","",x$nPierNumber[id])

pile_id = which(x$CP=="N-02" & x$Type==1)
x$nPierNumber[pile_id] = paste(x$nPierNumber[pile_id],"-P",x$pp2[pile_id],sep="")

## N-03 #
# e.g., P826-1, P826-2 (1 and 2 are pile numbers)
id = which(x$CP=="N-03")
x$nPierNumber[id] = x$PierNumber[id]
x$nPierNumber[id] = gsub("-","",x$nPierNumber[id])

pile_id = which(x$CP=="N-03" & x$Type==1)
x$nPierNumber[pile_id] = paste(x$nPierNumber[pile_id],"-",x$pp[pile_id],sep="")

head(x[which(x$CP=="N-03"),],20)

## N-04 ##
# e.g., P1159-01, P1159-02 (01 is pile number)
id = which(x$CP=="N-04")
x$nPierNumber[id] = x$PierNumber[id]
x$nPierNumber[id] = gsub("-","",x$nPierNumber[id])

pile_id = which(x$CP=="N-04" & x$Type==1)
x$nPierNumber[pile_id] = paste(x$nPierNumber[pile_id],"-",x$pp2[pile_id],sep="")


## Reformat date
x$updated = "2022-02-07"
x$updated = as.Date(x$updated, origin = "1899-12-30")
x$updated = as.Date(x$updated, format="%m/%d/%y %H:%M:%S")

x$start_date = as.Date(x$start_date, origin = "1899-12-30")
x$start_date = as.Date(x$start_date, format="%m/%d/%y %H:%M:%S")

x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# Re-assign ID
## Bored Piles: Contract Package No. + Pier Number + Structure Type + Bored Pile No.
### e.g., N-04-PLK-1-Pile-L1

## Others: Contract Package No. + Pier Number + Structure Type
### e.g., N-04-PLK-1-PileCap

x$Status1 = as.numeric(x$Status1)

write.xlsx(x,MLTable)
##


############################################################################

#******************************************************************#
## Enter Date of Update ##
date_update = "2023-04-25"

#******************************************************************#

gs4_auth(email="matsuzaki-ei@ocglobal.jp") #matsuzakieiji0@gmail.com
path =  path_home()

## Define working directory
wd = file.path(path, "Dropbox/01-Railway/02-NSCR-Ex/01-N2/03-During-Construction/02-Civil/03-Viaduct/01-Masterlist/02-Compiled")
setwd(wd)

# Read our master list table
## MasterList file name: "N2_Viaduct_MasterList.xlsx"
MLTable = file.choose()

# Read the masterlist:----
y = read.xlsx(MLTable)




############## BACKUP #################
## Skip if necessary
y$updated = as.Date(y$updated, origin = "1899-12-30")
y$updated = as.Date(y$updated, format="%m/%d/%y %H:%M:%S")
oldDate = gsub("-","",unique(y$updated))

fileName = paste(oldDate,"_",basename(MLTable),sep="")
direct = file.path(wd,"old")

write.xlsx(y,file.path(direct,fileName))
########## BACKUP END #################

##########************************************########
## The code below checks duplicated observations
## Run as necessary

#uType = unique(y$Type)
#uCP = unique(y$CP)

#temp = data.frame()
#for(i in uCP){
#  i="N-01"
#  for(j in uType){
#    j=2
#    yx = y[which(y$CP==i & y$Type==j),]
#    pierN = yx$nPierNumber
#    
#    dupPierN = pierN[duplicated(pierN)]
#
#    nrep = length(dupPierN)
#    t = data.frame(CP=rep(i,nrep),Type=rep(j,nrep),DupPierN=dupPierN)
#    temp = rbind(temp,t)
#  }
#}
#temp
#write.xlsx(temp,"N2_Duplicated_observations.xlsx")



###############################################################
####################### N-01 #################################:----
##############################################################

## Define URL where data is stored and updated
## I used "IMPORTRANGE" to copy information from the source URL to suit our needs.

url = "https://docs.google.com/spreadsheets/d/11NMBpr1nKXuOgooHDl-CARvrieVN7VjEpLM1XgNwR0c/edit?usp=sharing"

boredPiles = 2
pileC_pierC_pierH = 3
precast = 4

#################################
### N01: BORED PILES #############----
#################################

# 1. Read and write as CSV and xlsx
v = range_read(url, sheet = boredPiles)
v = data.frame(v)

# Extract only target field names
x = v[,c(3,12,22)]

colnames(x) = c("nPierNumber","end_date","Remarks")
x = x[-c(1,2),]

# 2. Check the presence of columns in the format of 'list'
coln = colnames(x)
for(i in seq(coln)) {
  type = class(x[[i]])
  
  # if type is 'list', unlist
  if(type == "list") {
    ## Convert NULL to NA
    x[[i]] = rrapply(x[[i]], f = function(x) replace(x, is.null(x), NA))
    
    ## then unlist
    x[[i]] = unlist(x[[i]], use.names = FALSE)
  }
}

# 3. Edit end_date
x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# 3. Edit nPierNumber:
## 3.1 Remove empty rows
rid = which(is.na(x$nPierNumber))
x = x[-rid,]

## 3.2. Remove bored piles for station structure
pile_id = which(str_detect(x$nPierNumber,"^P-|^P.*"))
x = x[pile_id,]

## 3.3. Remove hyphen from npierNumber
x$nPierNumber = gsub("-","",x$nPierNumber)

## 3.4. Detect duplicated nPierNumbers and if present delete
id = which(duplicated(x$nPierNumber))

if(length(id)>0){
  x = x[-id,]
} else {
  print("no duplicated observations")
}

# 4. Edit Status1
x$Status1 = 0

## 4.1. Assign status numbers
x$Status1[str_detect(x$Remarks,pattern="Casted|casted")] = 4 # Bored Pile completed
x$Status1[str_detect(x$Remarks,pattern="Inprogress|inprogress|In-Progress|in-progress")] = 1 # Under Construction
x$Status1[str_detect(x$Remarks,pattern="Incomplete|incomplete")] = 1 # Delayed

x$Status1[which(x$Status1==0)]=1
id = which(is.na(x$Status1))
if(length(id) > 0) {
  x = x[-id,]
} else {
  print("No NA for Status1")
}


# 5. Join new status to Viaduct masterlist
y = read.xlsx(MLTable)
yx = left_join(y,x,by="nPierNumber")

# 6. Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
x.pile = x$nPierNumber[x$Status1==4]
yx.pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==1 & yx$CP=="N-01")]

missing_in_yx = x.pile[!x.pile %in% yx.pile] # not exist in yx table
missing_in_x = yx.pile[!yx.pile %in% x.pile] # not exist in x table

check_Completed = function(){
  if(length(missing_in_yx)>0){
    print("You have missing nPierNumber in yx table compared with x table")
  } else {
  if(length(missing_in_x)>0){
    print("YOu have missing nPierNumber in x table compared with yx table")
  }
  }
}
check_Completed()

# 7. Check for all statuses
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP=="N-01" & yx$Type==1)])

check = x_t %in% yx_t

check_function = function(){
  if(length(which(check=="FALSE"))>0){
    print("Number of Status1 is DIFFERENT. PLEASE CHECK")
  } else (
    print("GOOD! The number of Status1 is same between Civil and joined excel ML.")
  )
}

check_function()

# 8. Update using new data
gg = which(yx$CP=="N-01" & yx$Type==1)

## 8.1. end_date
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")
yx$end_date.x[gg] = yx$end_date.y[gg]

## 8.2. Status1
yx$Status1.x[gg] = yx$Status1.y[gg]

# 9. Delete fields and change status names
delField = which(str_detect(colnames(yx),"Status1.y|Remarks|end_date.y"))
yx = yx[,-delField]

## Change field names
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"

# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
if(length(id) > 0) {
  yx$Status1[id] = 1
} else {
  print("no need to change Status1.")
}


# Check if empty status
id = nrow(yx[is.na(yx$Status1),])
if(id > 0) {
  print("There are rows missing Status1. Please check!!")
} else {
  print("Good. All rows have Status1. Please proceed.")
}

# Add date of updating table
## Delete old ones
iid = which(str_detect(colnames(yx),"updated|Updated|UPDATED"))
yx = yx[,-iid]
yx$updated = ymd(date_update)


# Overwrite MasterList
write.xlsx(yx, MLTable, overwrite = TRUE)

###################################################
# N-01: PILE CAP, PIER COLUN, and PIER HEAD:----
###################################################

## N-01 PILE CAP:-----
v = range_read(url, sheet = pileC_pierC_pierH)
v = data.frame(v)

x=v[,c(2,21,24)]
id = which(x[[1]] == "Mainline")
x=x[-c(1:id),]
colnames(x) = c("nPierNumber","end_date","Status1")

id=which(is.na(x$nPierNumber))
x=x[-id,]

# 2. Check the presence of columns in the format of 'list'
coln = colnames(x)
for(i in seq(coln)) {
  type = class(x[[i]])
  
  # if type is 'list', unlist
  if(type == "list") {
    ## Convert NULL to NA
    x[[i]] = rrapply(x[[i]], f = function(x) replace(x, is.null(x), NA))
    
    ## then unlist
    x[[i]] = unlist(x[[i]], use.names = FALSE)
  }
}

# 3. Edit end_date
x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# 4. Edit Status1
x$Status1 = as.numeric(x$Status1)
x$Status1[which(x$Status1 == 1)] = 4

## 4.2. check for NA and remove if present
id = which(is.na(x$Status1) | x$Status1 < 1)
if(length(id) > 0) {
  x = x[-id,]
} else {
  print("No NA for Status1")
}


# 5. Add field names
x$CP = "N-01"
x$Type = 2

# 6. Re-format nPierNumber ###
id = which(str_detect(x$nPierNumber,"Center$|center$|Right$|right$|Left$|left$"))
id_extract = str_extract(x[id,"nPierNumber"],"Center$|center$|Right$|right$|Left$|left$")
del_w = unique(id_extract)
del_w = paste(del_w,collapse="|",sep="")

## 6.1. Delete these words from nPierNumber
x$nPierNumber[id] = gsub(del_w,"",x$nPierNumber[id])
unique(x$nPierNumber)

## 6.2. Conver to uppercase
x$nPierNumber = toupper(x$nPierNumber)

## 6.3. Remove space
x$nPierNumber = gsub("[[:space:]]","",x$nPierNumber)

## 6.4. Remove bracket if present
x$nPierNumber = gsub("[()]","",x$nPierNumber)


# 7. Join 
y = read.xlsx(MLTable)
yx = left_join(y,x,by=c("nPierNumber","Type"))

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
x_pile = x$nPierNumber[which(x$Status1==4)]
yx_pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==2 & yx$CP.x=="N-01")]

missing_in_yx = x_pile[!x_pile %in% yx_pile] # not exist in yx table
missing_in_x = yx_pile[!yx_pile %in% x_pile] # not exist in x table

check_Completed()

# check all statuses
head(yx)
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-01" & yx$Type==2)])

check = x_t %in% yx_t
check_function()

# 8. Update table
## 8.1. end_date
gg = which(yx$CP.x=="N-01" & yx$Type==2)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")
yx$end_date.x[gg] = yx$end_date.y[gg]

## 8.2. Status1
yx$Status1.x[gg] = yx$Status1.y[gg]

## 8.3. Delete fields
delField = which(str_detect(colnames(yx),"Status1.y|CP.y|end_date.y"))
yx = yx[,-delField]

# 9. Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"

# 10. Convert Status
id = which(is.na(yx$Status1))
if(length(id) > 0) {
  yx$Status1[id] = 1
} else {
  print("no need to change Status1.")
}
## 10.1. Check the presence of any empty Status1
yx[is.na(yx$Status1),]

# 11. Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

yx[which(yx$CP=="N-01" & yx$Type==2 & yx$PierNumber=="P-1SB"),]

# 12. Export output
write.xlsx(yx, MLTable)


## N-01 PIER COLUMN:-----
v = range_read(url, sheet = pileC_pierC_pierH)
v = data.frame(v)

x=v[,c(2,32,37)]
id = which(x[[1]] == "Mainline")
x=x[-c(1:id),]

colnames(x) = c("nPierNumber","end_date","Status1")

id=which(is.na(x$nPierNumber))
x=x[-id,]

# 2. Check the presence of columns in the format of 'list'
coln = colnames(x)
for(i in seq(coln)) {
  type = class(x[[i]])
  
  # if type is 'list', unlist
  if(type == "list") {
    ## Convert NULL to NA
    x[[i]] = rrapply(x[[i]], f = function(x) replace(x, is.null(x), NA))
    
    ## then unlist
    x[[i]] = unlist(x[[i]], use.names = FALSE)
  }
}

# 3. Edit end_date
x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# 4. Edit Status1
x$Status1 = as.numeric(x$Status1)
x$Status1[which(x$Status1 == 1)] = 4

## 4.2. check for NA and remove if present
id = which(is.na(x$Status1) | x$Status1 < 1)
if(length(id) > 0) {
  x = x[-id,]
} else {
  print("No NA for Status1")
}

# 5. Add field names
x$CP = "N-01"
x$Type = 3

# 6. Re-format nPierNumber ###
id = which(str_detect(x$nPierNumber,"Center$|center$|Right$|right$|Left$|left$"))
id_extract = str_extract(x[id,"nPierNumber"],"Center$|center$|Right$|right$|Left$|left$")
del_w = unique(id_extract)
del_w = paste(del_w,collapse="|",sep="")

## 6.1. Delete these words from nPierNumber
x$nPierNumber[id] = gsub(del_w,"",x$nPierNumber[id])
unique(x$nPierNumber)

## 6.2. Conver to uppercase
x$nPierNumber = toupper(x$nPierNumber)

## 6.3. Remove space
x$nPierNumber = gsub("[[:space:]]","",x$nPierNumber)

## 6.4. Remove bracket if present
x$nPierNumber = gsub("[()]","",x$nPierNumber)


# 7. Join 
y = read.xlsx(MLTable)
yx = left_join(y,x,by=c("nPierNumber","Type"))

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
x_pile = x$nPierNumber[which(x$Status1==4)]
yx_pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==3 & yx$CP.x=="N-01")]

missing_in_yx = x_pile[!x_pile %in% yx_pile] # not exist in yx table
missing_in_x = yx_pile[!yx_pile %in% x_pile] # not exist in x table

check_Completed()

# check all statuses
head(yx)
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-01" & yx$Type==3)])

check = x_t %in% yx_t
check_function()

# 8. Update table
## 8.1. end_date
gg = which(yx$CP.y=="N-01" & yx$Type==3)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")
yx$end_date.x[gg] = yx$end_date.y[gg]

## 8.2. Status1
yx$Status1.x[gg] = yx$Status1.y[gg]

## 8.3. Delete fields
delField = which(str_detect(colnames(yx),"Status1.y|CP.y|end_date.y"))
yx = yx[,-delField]

# 9. Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"

# 10. Convert Status
id = which(is.na(yx$Status1))
if(length(id) > 0) {
  yx$Status1[id] = 1
} else {
  print("no need to change Status1.")
}
## 10.1. Check the presence of any empty Status1
yx[is.na(yx$Status1),]

# 11. Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

# 12. Export output
write.xlsx(yx, MLTable)


## N-01 PIER HEAD:-----
v = range_read(url, sheet = pileC_pierC_pierH)
v = data.frame(v)

x=v[,c(2,45,48)]
id = which(x[[1]] == "Mainline")
x=x[-c(1:id),]
colnames(x) = c("nPierNumber","end_date","Status1")

id=which(is.na(x$nPierNumber))
x=x[-id,]

# 2. Check the presence of columns in the format of 'list'
coln = colnames(x)
for(i in seq(coln)) {
  type = class(x[[i]])
  
  # if type is 'list', unlist
  if(type == "list") {
    ## Convert NULL to NA
    x[[i]] = rrapply(x[[i]], f = function(x) replace(x, is.null(x), NA))
    
    ## then unlist
    x[[i]] = unlist(x[[i]], use.names = FALSE)
  }
}

# 3. Edit end_date
x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# 4. Edit Status1
x$Status1 = as.numeric(x$Status1)
x$Status1[which(x$Status1 == 1)] = 4

## 4.2. check for NA and remove if present
id = which(is.na(x$Status1) | x$Status1 < 1)
if(length(id) > 0) {
  x = x[-id,]
} else {
  print("No NA for Status1")
}

# 5. Add field names
x$CP = "N-01"
x$Type = 4

# 6. Re-format nPierNumber ###
id = which(str_detect(x$nPierNumber,"Center$|center$|Right$|right$|Left$|left$"))
id_extract = str_extract(x[id,"nPierNumber"],"Center$|center$|Right$|right$|Left$|left$")
del_w = unique(id_extract)
del_w = paste(del_w,collapse="|",sep="")


## 6.1. Delete these words from nPierNumber
x$nPierNumber[id] = gsub(del_w,"",x$nPierNumber[id])
unique(x$nPierNumber)

## 6.2. Convert to uppercase
x$nPierNumber = toupper(x$nPierNumber)

## 6.3. Remove all spaces
x$nPierNumber = gsub("[[:space:]]","",x$nPierNumber)

## 6.4. Remove bracket if present
### for PierHead, there is a case where one PierHead supports two piers (SB/NB)
### N-01 data recorder uses P-169 (SB), P-169 (NB). But she only records P-169 (SB) for pier head
### As such, we need to find out this one and conver to 'P-169'
id = which(str_detect(x$nPierNumber, '[()]'))
x$nPierNumber[id] = gsub("[(NSB)]","",x$nPierNumber[id])


# 7. Join 
y = read.xlsx(MLTable)
yx = left_join(y,x,by=c("nPierNumber","Type"))

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
x_pile = x$nPierNumber[which(x$Status1==4)]
yx_pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==4 & yx$CP.x=="N-01")]

str(x_pile)
str(yx_pile)

missing_in_yx = x_pile[!x_pile %in% yx_pile] # not exist in yx table
missing_in_x = yx_pile[!yx_pile %in% x_pile] # not exist in x table

check_Completed()

# check all statuses
head(yx)
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-01" & yx$Type==4)])

check = x_t %in% yx_t
check_function()

# 8. Update table
## 8.1. end_date
gg = which(yx$CP.y=="N-01" & yx$Type==4)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")
yx$end_date.x[gg] = yx$end_date.y[gg]

## 8.2. Status1
yx$Status1.x[gg] = yx$Status1.y[gg]

## 8.3. Delete fields
delField = which(str_detect(colnames(yx),"Status1.y|CP.y|end_date.y"))
yx = yx[,-delField]

# 9. Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"

# 10. Convert Status
id = which(is.na(yx$Status1))
if(length(id) > 0) {
  yx$Status1[id] = 1
} else {
  print("no need to change Status1.")
}
## 10.1. Check the presence of any empty Status1
yx[is.na(yx$Status1),]

# 11. Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

# 12. Export output
write.xlsx(yx, MLTable)


###################################################
# N-01: Pre-CAST                        :----
###################################################

#url = "https://docs.google.com/spreadsheets/d/1Cl_tn3dTPdt8hrqzZtl_WjCxy9L-ltn7GrOmQpHdBw4/edit#gid=0"
#url = "https://docs.google.com/spreadsheets/d/11NMBpr1nKXuOgooHDl-CARvrieVN7VjEpLM1XgNwR0c/edit#gid=792494824"
# Read and write as CSV and xlsx
v = range_read(url, sheet = precast)
v = data.frame(v)

# Keep only fields needed
x = v[,c(3, 4,17,24)]

## colnames
colnames(x) = c("span","nPierNumber", "end_date", "Status1")

# 2. Check the presence of columns in the format of 'list'
coln = colnames(x)
for(i in seq(coln)) {
  type = class(x[[i]])
  
  # if type is 'list', unlist
  if(type == "list") {
    ## Convert NULL to NA
    x[[i]] = rrapply(x[[i]], f = function(x) replace(x, is.null(x), NA))
    
    ## then unlist
    x[[i]] = unlist(x[[i]], use.names = FALSE)
  }
}

# identify the beginning and end of pier number
## Beginning
id = which(str_detect(x[[3]],"Actual Finished"))
x = x[c(id+1:nrow(x)),]

## End
id = max(which(str_detect(x[[1]],"Span|span")))
x = x[1:id,]
x = x[,-1]

# 3. Edit end_date
x$end_date = as.numeric(x$end_date)
x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# 4. Edit Status1
x$Status1 = as.numeric(x$Status1)
id = which(x$Status1 == 1)
x = x[id,]
x$Status1[which(x$Status1 == 1)] = 4

## 4.2. check for NA and remove if present
id = which(is.na(x$Status1) | x$Status1 < 1)
if(length(id) > 0) {
  x = x[-id,]
} else {
  print("No NA for Status1")
}

# 5. Add field names
x$CP = "N-01"
x$Type = 5

# 6. Edit nPierNumber
x$nPierNumber = as.character(x$nPierNumber)
rem = unique(str_extract(x$nPierNumber,"\\([^()]+\\)"))

## 6.1. remove NA
rem = rem[!is.na(rem)]
rem = paste0(rem,collapse = "|")

## 6.2. remove from nPierNumber
id = which(str_detect(x$nPierNumber,rem))
x$nPierNumber[id] = gsub(rem,"",x$nPierNumber[id])

## 6.3. Remove curly bracket
id=which(str_detect(x$nPierNumber,"[()]"))
x$nPierNumber[id] = gsub("[()]","",x$nPierNumber[id])

## 6.4. Remove all spaces
x$nPierNumber = gsub("[[:space:]]","",x$nPierNumber)

## 6.5. To Uppercase
x$nPierNumber = toupper(x$nPierNumber)

## 6.6 Re-format nPierNumber so that it aligns with the GIS attribute table
id_NB = which(str_detect(x$nPierNumber,"NB"))
id_SB = which(str_detect(x$nPierNumber,"SB"))

x$nPierNumber = str_extract(x$nPierNumber,"^P\\d+|MT.*")
x$nPierNumber[id_NB] = paste(x$nPierNumber[id_NB],"NB",sep = "")
x$nPierNumber[id_SB] = paste(x$nPierNumber[id_SB],"SB",sep = "")

x$nPierNumber = gsub("-","",x$nPierNumber)


# 7. Check Duplicated observation
id = which(duplicated(x$nPierNumber))

## 7.1. note that duplicated observations could simply be derived from wron
if(length(id)>0){
  ##xx = xx[-id,]
  print("There are duplicated nPierNumbers PLEASE CHCECK!!!")
} else {
  print("no duplicated observations")
}


# 8. Join new status to Viaduct masterlist
y = read.xlsx(MLTable)
yx = left_join(y,x,by=c("nPierNumber","Type"))

## Check if the number of Status1 for each Type is same between x and yx.
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.y=="N-01" & yx$Type==5)])

check = x_t %in% yx_t
check_function()

x.precast = x$nPierNumber[x$Status1>=1]
yx.precast = yx$nPierNumber[which(yx$Type==5 & yx$CP.y=="N-01")]

missing_in_yx = x.precast[!x.precast %in% yx.precast] # not exist in yx table

# NA for status = 1 (To be Constructed)
gg = which(yx$CP.y=="N-01" & yx$Type==5)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")
yx$end_date.x[gg] = yx$end_date.y[gg]

## 8.2. Status1
yx$Status1.x[gg] = yx$Status1.y[gg]

delField = which(str_detect(colnames(yx),"Status1.y|start_date.y|CP.y|end_date.y"))
yx = yx[,-delField]

# Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"

# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
yx$Status1[id] = 1

# Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

# Recover data in excel format
yx$start_date = as.Date(yx$start_date, origin = "1899-12-30")
yx$start_date = as.Date(yx$start_date, format="%m/%d/%y %H:%M:%S")

yx[is.na(yx$Status1),]

# Output 
write.xlsx(yx, MLTable)


###############################################################
####################### N-02 #################################:----
##############################################################

#url = "https://docs.google.com/spreadsheets/d/1du9qnThdve1yXBv-W_lLzSa3RMd6wX6_NlNCz8PqFdg/edit?userstoinvite=junsanjose@gmail.com&actionButton=1#gid=0"
url = "https://docs.google.com/spreadsheets/d/1du9qnThdve1yXBv-W_lLzSa3RMd6wX6_NlNCz8PqFdg/edit?usp=sharing"

# sheet no
boredPile = 2
pileCap = 3
PierCol = 3
PierHead = 3

## TEMP
a = file.choose()
x = read.xlsx(a,sheet = 1)
head(x)

###########################
### N-02: BORED PILES #:----
################################

# Read and write as CSV and xlsx
v = range_read(url, sheet = boredPile)
v = data.frame(v)

id = which(str_detect(v[[2]], "^P-"))
x = v[id,]

# Restruecture table
## Remove empty rows and unneeded rows
x = x[,c(2,9,ncol(x))]
colnames(x) = c("nPierNumber", "end_date","Status1")
x$Status1 = as.character(x$Status1)

## No. 999
## Find pier numbers starting with only "P" and "MT"
keep_row = which(str_detect(x$nPierNumber, "^P-|^MT"))
x = x[keep_row,]

# Recode Status1
st = unique(x$Status1)

completed_row = which(str_detect(x$Status1,"Completed|completed|Complete|complete"))
inprogress_row = which(str_detect(x$Status1,"In-progress|in-progress|In-Progress|Inprogress"))

x$Status1[completed_row] = 4
x$Status1[inprogress_row] = 2

unique(x$Status1)

x$Status1 = as.numeric(x$Status1)
x$CP = "N-02"

# For N-02, I want the first "P-" to be "P"
x$nPierNumber[] = gsub("^P-|^p-|^P|^p", "P",x$nPierNumber)

id = which(x$end_date=="NULL")
x$end_date[id] = NA

da=unlist(x$end_date, use.names = FALSE)

x$end_date = da
x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01", tz="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")


## There are some duplicated observations
#id = x$nPierNumber[duplicated(x$nPierNumber)]
id = which(duplicated(x$nPierNumber))

if(length(id)>0){
  x = x[-id,]
} else {
  print("no duplicated observations")
}

# Join 
y = read.xlsx(MLTable)
yx = left_join(y,x,by="nPierNumber")

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
x_pile = x$nPierNumber[which(x$Status1==4)]
yx_pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==1 & yx$CP.x=="N-02")]

yx_pile[duplicated(yx_pile)]

str(x_pile)
str(yx_pile)

nn_x = str_extract(x_pile,"^P\\d+")
nn_x = gsub("P","",nn_x)
nn_x = unique(nn_x)

nn_y = str_extract(yx_pile,"^P\\d+")
nn_y = gsub("P","",nn_y)
nn_y = unique(nn_y)


missing_in_yx = x_pile[!x_pile %in% yx_pile] # not exist in yx table
missing_in_x = yx_pile[!yx_pile %in% x_pile] # not exist in x table

check_Completed()

# check all statuses
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-02" & yx$Type==1)])

check = x_t %in% yx_t
check_function()

# NA for status = 1 (To be Constructed)
#gg = which(yx$Status1.y>0)

gg = which(yx$CP.x=="N-02" & yx$Type==1)

library(lubridate)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")

yx$Status1.x[gg] = yx$Status1.y[gg]
yx$end_date.x[gg] = yx$end_date.y[gg]

# Rename column
delField = which(str_detect(colnames(yx),"Status1.y|Remarks|CP.y|end_date.y"))
yx = yx[,-delField]

# Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"

# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
yx$Status1[id] = 1

# Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

yx$updated = as.Date(yx$updated, origin = "1899-12-30")
yx$updated = as.Date(yx$updated, format="%m/%d/%y %H:%M:%S")
yx$start_date = as.Date(yx$start_date, origin = "1899-12-30")
yx$start_date = as.Date(yx$start_date, format="%m/%d/%y %H:%M:%S")

yx$end_date = as.Date(yx$end_date, origin = "1899-12-30")
yx$end_date = as.Date(yx$end_date, format="%m/%d/%y %H:%M:%S")


yx[is.na(yx$Status1),]

#t=yx$nPierNumber[which(yx$CP=="N-02" & yx$Type==1 & yx$Status1==4)]

# 
write.xlsx(yx, MLTable)

###################################################
# N-02: PILE CAP, PIER COLUN, and PIER HEAD:----
###################################################
## TEMP run
### When google sheet is not available but excel version is availablef from N2 civil
a = file.choose()
x = read.xlsx(a, sheet = 6)
x = x[-c(1:3),c(2,8,9)]
x[[2]] = as.numeric(x[[2]])
##

## N-02 PILE CAP:-----
v = range_read(url, sheet = pileCap)
v = data.frame(v)

x=v[,c(2,8,9)]
# identify start row
id = which(str_detect(colnames(x),"^Pier|No$"))
ii = x[,id]
id = min(which(str_detect(ii,"^P")))

x=x[id:nrow(x),]

colnames(x) = c("nPierNumber","end_date","Status1")

## unlist nPierNumber
for(i in seq(length(x$nPierNumber))){
  if(is.null(x$nPierNumber[[i]])){
    x$nPierNumber[[i]]=NA
  }
}
x$nPierNumber = unlist(x$nPierNumber)
x$nPierNumber = as.character(x$nPierNumber)

## unlist status
for(i in seq(length(x$Status1))){
  if(is.null(x$Status1[[i]])){
    x$Status1[[i]]=NA
  }
}
x$Status1 = unlist(x$Status1)
x$Status1 = as.numeric(x$Status1)

id = which(x$Status1 == 1)
x = x[id,]
x$Status1[x$Status1==1] = 4

x$CP = "N-02"

# remove na
id = which(is.na(x$Status1))
if(length(id)){
  x = x[-id,]
} else {
  print("")
}


# date
for(i in seq(length(x$end_date))){
  if(is.null(x$end_date[[i]])){
    x$end_date[[i]]=NA
  }
}
x$end_date = unlist(x$end_date)

x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# type
x$Type = 2

# Join 
y = read.xlsx(MLTable)
yx = left_join(y,x,by=c("nPierNumber","Type"))

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
x_pile = x$nPierNumber[which(x$Status1==4)]
yx_pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==2 & yx$CP.x=="N-02")]

str(x_pile)
str(yx_pile)

missing_in_yx = x_pile[!x_pile %in% yx_pile] # not exist in yx table
missing_in_x = yx_pile[!yx_pile %in% x_pile] # not exist in x table

check_Completed()

# check all statuses
head(yx)
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-02" & yx$Type==2)])

check = x_t %in% yx_t
check_function()

# NA for status = 1 (To be Constructed)
#gg = which(yx$Status1.y>0)

gg = which(yx$CP.x=="N-02" & yx$Type==2)

library(lubridate)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")

yx$Status1.x[gg] = yx$Status1.y[gg]
yx$end_date.x[gg] = yx$end_date.y[gg]

str(yx)
delField = which(str_detect(colnames(yx),"Status1.y|CP.y|end_date.y"))
yx = yx[,-delField]

# Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"
colnames(yx)[str_detect(colnames(yx),pattern="Year")] = "Year"
colnames(yx)[str_detect(colnames(yx),pattern="Month")] = "Month"

# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
yx$Status1[id] = 1

# Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

yx$updated = as.Date(yx$updated, origin = "1899-12-30")
yx$updated = as.Date(yx$updated, format="%m/%d/%y %H:%M:%S")

yx$end_date = as.Date(yx$end_date, origin = "1899-12-30")
yx$end_date = as.Date(yx$end_date, format="%m/%d/%y %H:%M:%S")


yx[is.na(yx$Status1),]

#t=yx$nPierNumber[which(yx$CP=="N-02" & yx$Type==2 & yx$Status1==4)]

# 
write.xlsx(yx, MLTable)


######################
# N-02: PIER COLUMN:----
######################
## TEMP run
### When google sheet is not available but excel version is availablef from N2 civil
a = file.choose()
x = read.xlsx(a, sheet = 6)
x = x[-c(1:3),c(2,14,15)]
x[[2]] = as.numeric(x[[2]])
##

v = range_read(url, sheet = PierCol)
v = data.frame(v)

x=v[,c(2,14,15)]

# identify start row
id = which(str_detect(colnames(x),"^Pier|No$"))
ii = x[,id]
id = min(which(str_detect(ii,"^P")))

x=x[id:nrow(x),]

colnames(x) = c("nPierNumber","end_date","Status1")

## unlist nPierNumber
for(i in seq(length(x$nPierNumber))){
  if(is.null(x$nPierNumber[[i]])){
    x$nPierNumber[[i]]=NA
  }
}
x$nPierNumber = unlist(x$nPierNumber)
x$nPierNumber = as.character(x$nPierNumber)


## unlist status
for(i in seq(length(x$Status1))){
  if(is.null(x$Status1[[i]])){
    x$Status1[[i]]=NA
  }
}
x$Status1 = unlist(x$Status1)
x$Status1 = as.numeric(x$Status1)
id = which(x$Status1 == 1)
x = x[id,]
x$Status1[x$Status1==1] = 4

x$CP = "N-02"

##
# remove na
id = which(is.na(x$Status1))
if(length(id)){
  x = x[-id,]
} else {
  print("")
}


# date
for(i in seq(length(x$end_date))){
  if(is.null(x$end_date[[i]])){
    x$end_date[[i]]=NA
  }
}
x$end_date = unlist(x$end_date)

x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# type
x$Type = 3

# Join 
y = read.xlsx(MLTable)
yx = left_join(y,x,by=c("nPierNumber","Type"))

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
x_pile = x$nPierNumber[which(x$Status1==4)]
yx_pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==3 & yx$CP.x=="N-02")]

str(x_pile)
str(yx_pile)

missing_in_yx = x_pile[!x_pile %in% yx_pile] # not exist in yx table
missing_in_x = yx_pile[!yx_pile %in% x_pile] # not exist in x table

check_Completed()

# check all statuses
head(yx)
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-02" & yx$Type==3)])

check = x_t %in% yx_t
check_function()

# NA for status = 1 (To be Constructed)
#gg = which(yx$Status1.y>0)

gg = which(yx$CP.x=="N-02" & yx$Type==3)

library(lubridate)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")

yx$Status1.x[gg] = yx$Status1.y[gg]
yx$end_date.x[gg] = yx$end_date.y[gg]

delField = which(str_detect(colnames(yx),"Status1.y|CP.y|end_date.y"))
yx = yx[,-delField]

# Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"
colnames(yx)[str_detect(colnames(yx),pattern="Year")] = "Year"
colnames(yx)[str_detect(colnames(yx),pattern="Month")] = "Month"

# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
yx$Status1[id] = 1

# Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

yx$updated = as.Date(yx$updated, origin = "1899-12-30")
yx$updated = as.Date(yx$updated, format="%m/%d/%y %H:%M:%S")

yx$end_date = as.Date(yx$end_date, origin = "1899-12-30")
yx$end_date = as.Date(yx$end_date, format="%m/%d/%y %H:%M:%S")


yx[is.na(yx$Status1),]

#t=yx$nPierNumber[which(yx$CP=="N-02" & yx$Type==2 & yx$Status1==4)]

# 
write.xlsx(yx, MLTable)

######################
# N-02: PIER Head:----
######################
## TEMP run
### When google sheet is not available but excel version is availablef from N2 civil
a = file.choose()
x = read.xlsx(a, sheet = 6)
x = x[-c(1:3),c(2,20,21)]
x[[2]] = as.numeric(x[[2]])
##

v = range_read(url, sheet = PierHead)
v = data.frame(v)

head(v)
x=v[,c(2,20,21)]

# identify start row
id = which(str_detect(colnames(x),"^Pier|No$"))
ii = x[,id]
id = min(which(str_detect(ii,"^P")))

x=x[id:nrow(x),]
colnames(x) = c("nPierNumber","end_date","Status1")

## unlist nPierNumber
for(i in seq(length(x$nPierNumber))){
  if(is.null(x$nPierNumber[[i]])){
    x$nPierNumber[[i]]=NA
  }
}
x$nPierNumber = unlist(x$nPierNumber)
x$nPierNumber = as.character(x$nPierNumber)

## unlist status
for(i in seq(length(x$Status1))){
  if(is.null(x$Status1[[i]])){
    x$Status1[[i]]=NA
  }
}
x$Status1 = unlist(x$Status1)
x$Status1 = as.numeric(x$Status1)
id = which(x$Status1 == 1)
x = x[id,]
x$Status1[x$Status1==1] = 4

x$CP = "N-02"

# remove na
id = which(is.na(x$Status1))
if(length(id)){
  x = x[-id,]
} else {
  print("")
}


# date
for(i in seq(length(x$end_date))){
  if(is.null(x$end_date[[i]])){
    x$end_date[[i]]=NA
  }
}
x$end_date = unlist(x$end_date)

x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")
str(x)
#

# type
x$Type = 4

# Join 
y = read.xlsx(MLTable)
yx = left_join(y,x,by=c("nPierNumber","Type"))

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
x_pc = x$nPierNumber[which(x$Status1==4)]
yx_pc = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==4 & yx$CP.x=="N-02")]

missing_in_yx = x_pc[!x_pc %in% yx_pc] # not exist in yx table
missing_in_x = yx_pc[!yx_pc %in% x_pc] # not exist in x table

check_Completed()

# check all statuses
head(yx)
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-02" & yx$Type==4)])

check = x_t %in% yx_t
check_function()

# NA for status = 1 (To be Constructed)
#gg = which(yx$Status1.y>0)

gg = which(yx$CP.x=="N-02" & yx$Type==4)

library(lubridate)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")

yx$Status1.x[gg] = yx$Status1.y[gg]
yx$end_date.x[gg] = yx$end_date.y[gg]

delField = which(str_detect(colnames(yx),"Status1.y|CP.y|end_date.y"))
yx = yx[,-delField]

# Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"
colnames(yx)[str_detect(colnames(yx),pattern="Year")] = "Year"
colnames(yx)[str_detect(colnames(yx),pattern="Month")] = "Month"

# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
yx$Status1[id] = 1

# Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

yx$updated = as.Date(yx$updated, origin = "1899-12-30")
yx$updated = as.Date(yx$updated, format="%m/%d/%y %H:%M:%S")

yx$end_date = as.Date(yx$end_date, origin = "1899-12-30")
yx$end_date = as.Date(yx$end_date, format="%m/%d/%y %H:%M:%S")


yx[is.na(yx$Status1),]

# 
write.xlsx(yx, MLTable)



###############################################################
####################### N-03 #################################:----
##############################################################
# original
#url = "https://docs.google.com/spreadsheets/d/19TBfdEpRuW7edwhiP7YdVSJQgrkot9wN7tDwzSTF76E/edit#gid=0"

url = "https://docs.google.com/spreadsheets/d/19TBfdEpRuW7edwhiP7YdVSJQgrkot9wN7tDwzSTF76E/edit?usp=sharing"
n03_pile = 1
n03_others = 2
CP = "N-03"

############################################
###### N-03: Bored Piles #######:----
###########################################
## TEMP run
### When google sheet is not available but excel version is availablef from N2 civil
a = file.choose()
x = read.xlsx(a, sheet = 5)

x = x[,c(2,15,24)]
head(x)
id = which(x[[2]] == "Date")
x = x[-c(1:12),]
x[[2]] = as.numeric(x[[2]])

##

# read and write as CSV and xlsx
v = range_read(url, sheet = n03_pile)
v = data.frame(v)

# filter out

x = v[,c(2,8,14)]
colnames(x) = c("nPierNumber", "end_date","Status1")

# Convert to string
x$nPierNumber = as.character(x$nPierNumber)
x$Status1 = as.character(x$Status1)
x$CP = CP

# Delete empty cells
rem_id = which(is.na(x$Status1))
if(length(rem_id)) {
  x = x[-rem_id,]
} else {
  print("No empty cells")
}


# Extract only piles
pile_id = which(str_detect(x$nPierNumber,"^P-"))
x = x[pile_id,]

x$nPierNumber = gsub("^P-","P",x$nPierNumber)

# fix some bored pile numbers
id = which(str_detect(x$nPierNumber,"-0[0-9]$"))
x$nPierNumber[id] = gsub("-0", "-", x$nPierNumber[id])

# Note if pier number has these notations, we need to fix this. "P976R-4" = "P976-R4"
id = which(str_detect(x$nPierNumber, ".*L-"))
x$nPierNumber[id] = gsub("L-", "-L",x$nPierNumber[id])

id = which(str_detect(x$nPierNumber, ".*R-"))
x$nPierNumber[id] = gsub("R-", "-R",x$nPierNumber[id])

# convert stats
x$Status1[str_detect(x$Status1,pattern="Completed|completed")] = 4 # Bored Pile completed
x$Status1[str_detect(x$Status1,pattern="Inprogress")] = 2 # Under Construction
x$Status1[str_detect(x$Status1,pattern="Incomplete")] = 3 # Delayed

x$Status1 = as.numeric(x$Status1)

## Convert date format
# Convert date format
for(i in seq(length(x$end_date))){
  if(is.null(x$end_date[[i]])){
    x$end_date[[i]]=NA
  }
}
x$end_date = unlist(x$end_date)

x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# Remove duplicated observations if any
id = which(duplicated(x$nPierNumber))

if(length(id)>0){
  x = x[-id,]
} else {
  print("no duplicated observations")
}

# Read master list and join
y = read.xlsx(MLTable)

## Join 
yx = left_join(y,x,by="nPierNumber")

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
x.pile = x$nPierNumber[x$Status1==4]
yx.pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==1 & yx$CP.x=="N-03")]

missing_in_yx = x.pile[!x.pile %in% yx.pile] # not exist in yx table
missing_in_x = yx.pile[!yx.pile %in% x.pile] # not exist in x table

check_Completed()


# check all statuses
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-03" & yx$Type==1)])

check = x_t %in% yx_t
check_function()

# NA for status = 1 (To be Constructed)
gg = which(yx$CP.x=="N-03" & yx$Type==1)

yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")
yx$Status1.x[gg] = yx$Status1.y[gg]
yx$end_date.x[gg] = yx$end_date.y[gg]

delField = which(str_detect(colnames(yx), "Status1.y|CP.y|end_date.y"))
yx = yx[,-delField]

# Change Status name
head(yx)
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"
colnames(yx)[str_detect(colnames(yx),pattern="Year")] = "Year"
colnames(yx)[str_detect(colnames(yx),pattern="Month")] = "Month"

# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
yx$Status1[id] = 1


# Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
library(lubridate)
yx$updated = ymd(date_update)

yx$updated = as.Date(yx$updated, origin = "1899-12-30")
yx$updated = as.Date(yx$updated, format="%m/%d/%y %H:%M:%S")

yx$start_date = as.Date(yx$start_date, origin = "1899-12-30")
yx$start_date = as.Date(yx$start_date, format="%m/%d/%y %H:%M:%S")

yx$end_date = as.Date(yx$end_date, origin = "1899-12-30")
yx$end_date = as.Date(yx$end_date, format="%m/%d/%y %H:%M:%S")

head(yx)
yx[is.na(yx$Status1),]

# 
write.xlsx(yx, MLTable)



###################################################
# N-03: PILE CAP, PIER COLUN, and PIER HEAD:----
###################################################

## N-03 PILE CAP:-----
## TEMP run
### When google sheet is not available but excel version is availablef from N2 civil
a = file.choose()
x = read.xlsx(a, sheet = 3)
x = x[,c(1,19,22)]

id = which(x[[3]] == 'Completed')
x = x[-c(1:id),]
x[[2]] = as.numeric(x[[2]])
##

v = range_read(url, sheet = n03_others)
v = data.frame(v)

x=v[,c(1,19,22)]
id = which(str_detect(x[[3]],"Completed"))
x=x[id:nrow(x),]

colnames(x) = c("nPierNumber","end_date","Status1")

# re-format Status1
id = which(str_detect(x$Status1, "%$"))
x$Status1[id] = gsub("%","",x$Status1[id])
x$Status1 = as.numeric(x$Status1)
x$Status1 = x$Status1/100

id=which(is.na(x$Status1))
x=x[-id,]

##
# keep only completed
completed_row = which(x$Status1 == 1)
x$Status1[completed_row] = 4

x$CP = "N-03"

# date
for(i in seq(length(x$end_date))){
  if(is.null(x$end_date[[i]])){
    x$end_date[[i]]=NA
  }
}
x$end_date = unlist(x$end_date)

x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# type
x$Type = 2

# Extract only piles
pile_id = which(str_detect(x$nPierNumber,"^P-"))
x = x[pile_id,]

x$nPierNumber = gsub("^P-","P",x$nPierNumber)

# Note if pier number has these notations, we need to fix this. "P976R-4" = "P976-R4"
id = which(str_detect(x$nPierNumber, ".*L-"))
x$nPierNumber[id] = gsub("L-", "-L",x$nPierNumber[id])

id = which(str_detect(x$nPierNumber, ".*R-"))
x$nPierNumber[id] = gsub("R-", "-R",x$nPierNumber[id])

id = which(str_detect(x$nPierNumber, ".*L"))
x$nPierNumber[id] = gsub("L", "-L", x$nPierNumber[id])

id = which(str_detect(x$nPierNumber, ".*R"))
x$nPierNumber[id] = gsub("R", "-R", x$nPierNumber[id])

# Join 
y = read.xlsx(MLTable)
yx = left_join(y,x,by=c("nPierNumber","Type"))

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
head(yx)
x_pile = x$nPierNumber[which(x$Status1==4)]
yx_pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==2 & yx$CP.x=="N-03")]

str(x_pile)
str(yx_pile)

missing_in_yx = x_pile[!x_pile %in% yx_pile] # not exist in yx table
missing_in_x = yx_pile[!yx_pile %in% x_pile] # not exist in x table

check_Completed()

# check all statuses
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-03" & yx$Type==2)])

check = x_t %in% yx_t
check_function()

# NA for status = 1 (To be Constructed)
#gg = which(yx$Status1.y>0)

gg = which(yx$CP.x=="N-03" & yx$Type==2)

library(lubridate)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")

yx$Status1.x[gg] = yx$Status1.y[gg]
yx$end_date.x[gg] = yx$end_date.y[gg]

delField = which(str_detect(colnames(yx),"Status1.y|CP.y|end_date.y"))
yx = yx[,-delField]

# Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"
colnames(yx)[str_detect(colnames(yx),pattern="Year")] = "Year"
colnames(yx)[str_detect(colnames(yx),pattern="Month")] = "Month"

# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
yx$Status1[id] = 1

# Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

yx$updated = as.Date(yx$updated, origin = "1899-12-30")
yx$updated = as.Date(yx$updated, format="%m/%d/%y %H:%M:%S")

yx$end_date = as.Date(yx$end_date, origin = "1899-12-30")
yx$end_date = as.Date(yx$end_date, format="%m/%d/%y %H:%M:%S")


yx[is.na(yx$Status1),]

#t=yx$nPierNumber[which(yx$CP=="N-02" & yx$Type==2 & yx$Status1==4)]

# 
write.xlsx(yx, MLTable)


## N-03 PIER COLUMN:-----
## TEMP run
### When google sheet is not available but excel version is availablef from N2 civil
a = file.choose()
x = read.xlsx(a, sheet = 3)
x = x[,c(1,30,35)]

id = which(x[[3]] == 'Completed')
x = x[-c(1:id),]
x[[2]] = as.numeric(x[[2]])

##

v = range_read(url, sheet = n03_others)
v = data.frame(v)

x=v[,c(1,32,35)]
id = which(str_detect(x[[3]],"Completed"))
x=x[id:nrow(x),]

colnames(x) = c("nPierNumber","end_date","Status1")

# re-format Status1
id = which(str_detect(x$Status1, "%$"))
x$Status1[id] = gsub("%","",x$Status1[id])
x$Status1 = as.numeric(x$Status1)
x$Status1 = x$Status1/100

id=which(is.na(x$Status1))
x=x[-id,]

##
# keep only completed
completed_row = which(x$Status1 == 1)
x$Status1[completed_row] = 4

x$CP = "N-03"

# date
str(x)
for(i in seq(length(x$end_date))){
  if(is.null(x$end_date[[i]])){
    x$end_date[[i]]=NA
  }
}
x$end_date = unlist(x$end_date)
x$end_date = as.numeric(x$end_date)

x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# type
x$Type = 3

# Extract only piles
pile_id = which(str_detect(x$nPierNumber,"^P-"))
x = x[pile_id,]

x$nPierNumber = gsub("^P-","P",x$nPierNumber)

# Note if pier number has these notations, we need to fix this. "P976R-4" = "P976-R4"
id = which(str_detect(x$nPierNumber, ".*L-"))
x$nPierNumber[id] = gsub("L-", "-L",x$nPierNumber[id])

id = which(str_detect(x$nPierNumber, ".*R-"))
x$nPierNumber[id] = gsub("R-", "-R",x$nPierNumber[id])

# Join 
y = read.xlsx(MLTable)
yx = left_join(y,x,by=c("nPierNumber","Type"))

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
head(yx)
x_pile = x$nPierNumber[which(x$Status1==4)]
yx_pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==3 & yx$CP.x=="N-03")]

str(x_pile)
str(yx_pile)

missing_in_yx = x_pile[!x_pile %in% yx_pile] # not exist in yx table
missing_in_x = yx_pile[!yx_pile %in% x_pile] # not exist in x table

check_Completed()

# check all statuses
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-03" & yx$Type==3)])

check = x_t %in% yx_t
check_function()

# NA for status = 1 (To be Constructed)
#gg = which(yx$Status1.y>0)

gg = which(yx$CP.x=="N-03" & yx$Type==3)

library(lubridate)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")

yx$Status1.x[gg] = yx$Status1.y[gg]
yx$end_date.x[gg] = yx$end_date.y[gg]

delField = which(str_detect(colnames(yx),"Status1.y|CP.y|end_date.y"))
yx = yx[,-delField]

# Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"
colnames(yx)[str_detect(colnames(yx),pattern="Year")] = "Year"
colnames(yx)[str_detect(colnames(yx),pattern="Month")] = "Month"

# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
yx$Status1[id] = 1

# Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

yx$updated = as.Date(yx$updated, origin = "1899-12-30")
yx$updated = as.Date(yx$updated, format="%m/%d/%y %H:%M:%S")

yx$end_date = as.Date(yx$end_date, origin = "1899-12-30")
yx$end_date = as.Date(yx$end_date, format="%m/%d/%y %H:%M:%S")


yx[is.na(yx$Status1),]

#t=yx$nPierNumber[which(yx$CP=="N-02" & yx$Type==2 & yx$Status1==4)]

# 
write.xlsx(yx, MLTable)

## N-03 PIER Head:-----
## TEMP run
### When google sheet is not available but excel version is availablef from N2 civil
a = file.choose()
x = read.xlsx(a, sheet = 3)
x = x[,c(1,43,46)]

id = which(x[[3]] == 'Completed')
x = x[-c(1:id),]
x[[2]] = as.numeric(x[[2]])

##

v = range_read(url, sheet = n03_others)
v = data.frame(v)

x=v[,c(1,43,46)]
id = which(str_detect(x[[3]],"Completed"))
x=x[id:nrow(x),]

colnames(x) = c("nPierNumber","end_date","Status1")

# re-format Status1
id = which(str_detect(x$Status1, "%$"))
x$Status1[id] = gsub("%","",x$Status1[id])
x$Status1 = as.numeric(x$Status1)
x$Status1 = x$Status1/100

id=which(is.na(x$Status1))
x=x[-id,]

##
# keep only completed
completed_row = which(x$Status1 == 1)
x$Status1[completed_row] = 4

x$CP = "N-03"

# date
for(i in seq(length(x$end_date))){
  if(is.null(x$end_date[[i]])){
    x$end_date[[i]]=NA
  }
}
x$end_date = unlist(x$end_date)

x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# type
x$Type = 4

# Extract only piles
pile_id = which(str_detect(x$nPierNumber,"^P-"))
x = x[pile_id,]

x$nPierNumber = gsub("^P-","P",x$nPierNumber)

# Note if pier number has these notations, we need to fix this. "P976R-4" = "P976-R4"
id = which(str_detect(x$nPierNumber, ".*L-"))
x$nPierNumber[id] = gsub("L-", "-L",x$nPierNumber[id])

id = which(str_detect(x$nPierNumber, ".*R-"))
x$nPierNumber[id] = gsub("R-", "-R",x$nPierNumber[id])

# Join 
y = read.xlsx(MLTable)
yx = left_join(y,x,by=c("nPierNumber","Type"))

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
head(yx)
x_pile = x$nPierNumber[which(x$Status1==4)]
yx_pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==4 & yx$CP.x=="N-03")]

str(x_pile)
str(yx_pile)

missing_in_yx = x_pile[!x_pile %in% yx_pile] # not exist in yx table
missing_in_x = yx_pile[!yx_pile %in% x_pile] # not exist in x table

check_Completed()

# check all statuses
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-03" & yx$Type==4)])

check = x_t %in% yx_t
check_function()

# NA for status = 1 (To be Constructed)
#gg = which(yx$Status1.y>0)

gg = which(yx$CP.x=="N-03" & yx$Type==4)

library(lubridate)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")

yx$Status1.x[gg] = yx$Status1.y[gg]
yx$end_date.x[gg] = yx$end_date.y[gg]

delField = which(str_detect(colnames(yx),"Status1.y|CP.y|end_date.y|Year.y|Month.y"))
yx = yx[,-delField]

# Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"
colnames(yx)[str_detect(colnames(yx),pattern="Year")] = "Year"
colnames(yx)[str_detect(colnames(yx),pattern="Month")] = "Month"

# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
yx$Status1[id] = 1

# Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

yx$updated = as.Date(yx$updated, origin = "1899-12-30")
yx$updated = as.Date(yx$updated, format="%m/%d/%y %H:%M:%S")

yx$end_date = as.Date(yx$end_date, origin = "1899-12-30")
yx$end_date = as.Date(yx$end_date, format="%m/%d/%y %H:%M:%S")


yx[is.na(yx$Status1),]

#t=yx$nPierNumber[which(yx$CP=="N-02" & yx$Type==2 & yx$Status1==4)]

# 
write.xlsx(yx, MLTable)


###############################################################
####################### N-04 #################################:----
##############################################################
boredPile = 4
pCap_pCol_pHead = 5

#url = "https://docs.google.com/spreadsheets/d/1OWdmM36PWL5MgH0lK9HpigaoVq4L7Q6hm7DSN2FxiAA/edit#gid=0"
url = "https://docs.google.com/spreadsheets/d/1uVTh_m8Owr4dYypHSSc0nRnGzYCdtceiASCj_oPd6jo/edit?usp=sharing"

### N-04: BORED PILES #:----
## TEMP run
### When google sheet is not available but excel version is availablef from N2 civil
a = file.choose()
x = read.xlsx(a, sheet = 2)
head(x,20)
x = x[,c(6,19,30)]

id = which(x[[3]] == "Status")
x = x[-c(1:id),]
x[[2]] = as.numeric(x[[2]])

##

# Read and write as CSV and xlsx
v = range_read(url, sheet = boredPile)
v = data.frame(v)

# Restruecture table
## I temporarliy used dummy field names to be discarded so need to remove it
x = v[,c(6,19,30)]
colnames(x) = c("nPierNumber","end_date","Status1")

## Remove empty rows
rid = which(is.na(x$nPierNumber))

if(length(rid)==0){
  print("no nrows being removed")
} else {
  x = x[-rid,]
}

x$nPierNumber = as.character(x$nPierNumber)


# Remove hyphen from pierNumber
## correct with "P-"
x$nPierNumber = gsub("[[:space:]]","",x$nPierNumber)
#x$nPierNumber = gsub("^[P]","P-",x$nPierNumber)
#x$nPierNumber = gsub("^PLK ","PLK-",x$nPierNumber)
x$nPierNumber = gsub("DEPO","DEP0",x$nPierNumber)

# Remove rows that do not contain the following texts "P", "PLK", "DEP0"
x = x[str_detect(x$nPierNumber,"^P|^PLK|^DEP0"),]

# Unlist Status1
id = which(x$Status1=="NULL")
x$Status1[id] = NA

Status1_ = unlist(x$Status1, use.names = FALSE)
x$Status1 = Status1_

x$Status1[str_detect(x$Status1,pattern="Casted|casted")] = 4 # Bored Pile completed
x$Status1[str_detect(x$Status1,pattern="Inprogress")] = 2 # Under Construction
x$Status1[str_detect(x$Status1,pattern="Incomplete")] = 3 # Delayed

# Unlist end_date
id = which(x$end_date == "NULL")
x$end_date[id] = NA

end_date_ = unlist(x$end_date, use.names = FALSE)
x$end_date = end_date_

# Delete na status
del_id = which(is.na(x$Status1))
if(length(del_id)){
  x = x[-del_id,]
} else {
  print("")
}


x$Status1 = as.numeric(x$Status1)

## Fix some wrong notation of nPierNumber
id_LS = which(str_detect(x$nPierNumber,'LS'))
id_RS = which(str_detect(x$nPierNumber,'RS'))

x$nPierNumber[id_LS] = gsub("LS-01","-1LS",x$nPierNumber[id_LS])
x$nPierNumber[id_LS] = gsub("LS-02","-2LS",x$nPierNumber[id_LS])
x$nPierNumber[id_LS] = gsub("LS-03","-3LS",x$nPierNumber[id_LS])

x$nPierNumber[id_LS] = gsub("01LS","1LS",x$nPierNumber[id_LS])
x$nPierNumber[id_LS] = gsub("02LS","2LS",x$nPierNumber[id_LS])

x$nPierNumber[id_RS] = gsub("RS-01","-1RS",x$nPierNumber[id_RS])
x$nPierNumber[id_RS] = gsub("RS-02","-2RS",x$nPierNumber[id_RS])
x$nPierNumber[id_RS] = gsub("RS-03","-3RS",x$nPierNumber[id_RS])

x$nPierNumber[id_RS] = gsub("01RS","1RS",x$nPierNumber[id_RS])
x$nPierNumber[id_RS] = gsub("02RS","2RS",x$nPierNumber[id_RS])

# Convert date format
x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin="1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# Remove duplicated observations if any
id = which(duplicated(x$nPierNumber))

if(length(id)>0){
  x = x[-id,]
} else {
  print("no duplicated observations")
}

#id = which(str_detect(x$nPierNumber,'^DEP'))
# Join new status to Viaduct masterlist

y = read.xlsx(MLTable)
yx = left_join(y,x,by="nPierNumber")

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
x.pile = x$nPierNumber[x$Status1==4]
yx.pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==1 & yx$CP=="N-04")]

missing_in_yx = x.pile[!x.pile %in% yx.pile] # not exist in yx table
missing_in_x = yx.pile[!yx.pile %in% x.pile] # not exist in x table

check_Completed()

# check all statuses
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP=="N-04" & yx$Type==1)])

check = x_t %in% yx_t
check_function() 
# if the number discrepancey originates from P1159 and P1160, you can skip. Civil Team's
# master list duplicates these observations.

# NA for status = 1 (To be Constructed)
gg = which(yx$CP.x=="N-04" & yx$Type==1)

yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")

yx$Status1.x[gg] = yx$Status1.y[gg]
yx$end_date.x[gg] = yx$end_date.y[gg]

delField = which(str_detect(colnames(yx), "Status1.y|Remarks|CP.y|end_date.y"))
yx = yx[,-delField]

# Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"
colnames(yx)[str_detect(colnames(yx),pattern="Year")] = "Year"
colnames(yx)[str_detect(colnames(yx),pattern="Month")] = "Month"


# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
yx$Status1[id] = 1

# Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
library(lubridate)


yx$updated = ymd(date_update)

yx$updated = as.Date(yx$updated, origin = "1899-12-30")
yx$updated = as.Date(yx$updated, format="%m/%d/%y %H:%M:%S")
yx$start_date = as.Date(yx$start_date, origin = "1899-12-30")
yx$start_date = as.Date(yx$start_date, format="%m/%d/%y %H:%M:%S")

yx$end_date = as.Date(yx$end_date, origin = "1899-12-30")
yx$end_date = as.Date(yx$end_date, format="%m/%d/%y %H:%M:%S")

yx[is.na(yx$Status1),]

# 
write.xlsx(yx, MLTable)

###################################################
### N-04: Pilec Caps, Pier, and Pier Head #;----
###################################################

## N-04 PILE CAP:-----
v = range_read(url, sheet = pCap_pCol_pHead)
v = data.frame(v)

x=v[,c(2,15)]

# unlist
for(i in seq(length(x[[2]]))){
  if(is.null(x[[2]][[i]])){
    x[[2]][[i]]=NA
  }
}
x[[2]] = unlist(x[[2]])

#
id = which(str_detect(x[[2]],"Completed$"))
x=x[-c(1:id),]

# Remove empty dates
id = which(is.na(x[[2]]))
x = x[-id,]

# Add Status1
x$Status1 = 4
colnames(x) = c("nPierNumber","end_date","Status1")

# remove duplicated
id = which(duplicated(x$nPierNumber))
x$nPierNumber[id]
if(length(id)>0){
  x = x[-id,]
} else {
  print("no duplicated observations")
}

# convert date to numeric
x$end_date = as.numeric(x$end_date)

x$CP = "N-04"
x

# date
x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# type
x$Type = 2

# Extract only piles
# Re-format nPierNumber
unique(x$nPierNumber)
x$nPierNumber = gsub("[[:space:]]","",x$nPierNumber)

x$nPierNumber[] = gsub("^P ","P",x$nPierNumber)
x$nPierNumber[] = gsub("P-","P",x$nPierNumber)

x$nPierNumber = gsub("LS","-LS",x$nPierNumber)
x$nPierNumber = gsub("RS","-RS",x$nPierNumber)

# Join 
y = read.xlsx(MLTable)
yx = left_join(y,x,by=c("nPierNumber","Type"))

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
head(yx)
x_pile = x$nPierNumber[which(x$Status1==4)]
yx_pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==2 & yx$CP.x=="N-04")]

# check duplication
#dPileCap = x$nPierNumber[which(x$Type==2 & x$nPierNumber=="P1161-LS")]
x_pile[duplicated(x_pile)]
yx_pile[duplicated(yx_pile)]

str(x_pile)
str(yx_pile)

missing_in_yx = x_pile[!x_pile %in% yx_pile] # not exist in yx table
missing_in_x = yx_pile[!yx_pile %in% x_pile] # not exist in x table

check_Completed()

# check all statuses
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-04" & yx$Type==2)])

check = x_t %in% yx_t
check_function()

# NA for status = 1 (To be Constructed)
#gg = which(yx$Status1.y>0)

gg = which(yx$CP.x=="N-04" & yx$Type==2)

library(lubridate)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")

yx$Status1.x[gg] = yx$Status1.y[gg]
yx$end_date.x[gg] = yx$end_date.y[gg]

delField = which(str_detect(colnames(yx),"Status1.y|CP.y|end_date.y"))
yx = yx[,-delField]

# Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"
colnames(yx)[str_detect(colnames(yx),pattern="Year")] = "Year"
colnames(yx)[str_detect(colnames(yx),pattern="Month")] = "Month"

# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
yx$Status1[id] = 1

# Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

yx$updated = as.Date(yx$updated, origin = "1899-12-30")
yx$updated = as.Date(yx$updated, format="%m/%d/%y %H:%M:%S")

yx$end_date = as.Date(yx$end_date, origin = "1899-12-30")
yx$end_date = as.Date(yx$end_date, format="%m/%d/%y %H:%M:%S")


yx[is.na(yx$Status1),]

#t=yx$nPierNumber[which(yx$CP=="N-02" & yx$Type==2 & yx$Status1==4)]

# 
write.xlsx(yx, MLTable)


## N-04 PIER COLUMN:-----
v = range_read(url, sheet = pCap_pCol_pHead)
v = data.frame(v)

x=v[,c(2,26)]

# unlist
for(i in seq(length(x[[2]]))){
  if(is.null(x[[2]][[i]])){
    x[[2]][[i]]=NA
  }
}
x[[2]] = unlist(x[[2]])

#
# remove duplicated
id = which(duplicated(x$nPierNumber))
x$nPierNumber[id]
if(length(id)>0){
  x = x[-id,]
} else {
  print("no duplicated observations")
}

#
id = which(str_detect(x[[2]],"Completed$"))
x=x[-c(1:id),]

# Remove empty dates
id = which(is.na(x[[2]]))
x = x[-id,]

# Add Status1
x$Status1 = 4
colnames(x) = c("nPierNumber","end_date","Status1")

# convert date to numeric
x$end_date = as.numeric(x$end_date)

x$CP = "N-04"

# date
x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# type
x$Type = 3

# Extract only piles
# Re-format nPierNumber
unique(x$nPierNumber)
x$nPierNumber = gsub("[[:space:]]","",x$nPierNumber)

x$nPierNumber[] = gsub("^P ","P",x$nPierNumber)
x$nPierNumber[] = gsub("P-","P",x$nPierNumber)

x$nPierNumber = gsub("LS","-LS",x$nPierNumber)
x$nPierNumber = gsub("RS","-RS",x$nPierNumber)

# Join 
y = read.xlsx(MLTable)
yx = left_join(y,x,by=c("nPierNumber","Type"))

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
head(yx)
x_pile = x$nPierNumber[which(x$Status1==4)]
yx_pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==3 & yx$CP.x=="N-04")]

str(x_pile)
str(yx_pile)

missing_in_yx = x_pile[!x_pile %in% yx_pile] # not exist in yx table
missing_in_x = yx_pile[!yx_pile %in% x_pile] # not exist in x table

check_Completed()

# check all statuses
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-04" & yx$Type==3)])

check = x_t %in% yx_t
check_function()

# NA for status = 1 (To be Constructed)
#gg = which(yx$Status1.y>0)

gg = which(yx$CP.x=="N-04" & yx$Type==3)

library(lubridate)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")

yx$Status1.x[gg] = yx$Status1.y[gg]
yx$end_date.x[gg] = yx$end_date.y[gg]

str(yx)
delField = which(str_detect(colnames(yx),"Status1.y|CP.y|end_date.y"))
yx = yx[,-delField]

# Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"
colnames(yx)[str_detect(colnames(yx),pattern="Year")] = "Year"
colnames(yx)[str_detect(colnames(yx),pattern="Month")] = "Month"

# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
yx$Status1[id] = 1

# Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

yx$updated = as.Date(yx$updated, origin = "1899-12-30")
yx$updated = as.Date(yx$updated, format="%m/%d/%y %H:%M:%S")

yx$end_date = as.Date(yx$end_date, origin = "1899-12-30")
yx$end_date = as.Date(yx$end_date, format="%m/%d/%y %H:%M:%S")


yx[is.na(yx$Status1),]

#t=yx$nPierNumber[which(yx$CP=="N-02" & yx$Type==2 & yx$Status1==4)]

# 
write.xlsx(yx, MLTable)


## N-04 PIER HEAD:-----
v = range_read(url, sheet = pCap_pCol_pHead)
v = data.frame(v)

x=v[,c(2,31)]

#
id = which(str_detect(x[[2]],"Completed$"))
x=x[-c(1:id),]

# Remove empty dates
for(i in seq(length(x[[2]]))){
  if(is.null(x[[2]][[i]])){
    x[[2]][[i]]=NA
  }
}
x[[2]] = unlist(x[[2]])
id = which(x[[2]] >= 1)
x = x[id,]

x$Status1[which(x[[2]] >= 1)] = 4

# Rename
colnames(x) = c("nPierNumber","end_date","Status1")

# remove duplicated
id = which(duplicated(x$nPierNumber))
x$nPierNumber[id]
if(length(id)>0){
  x = x[-id,]
} else {
  print("no duplicated observations")
}


# convert date to numeric
x$end_date = as.numeric(x$end_date)
x$CP = "N-04"

# date
x$end_date = as.POSIXlt(x$end_date, origin="1970-01-01",tZ="UTC")
x$end_date = as.Date(x$end_date, origin = "1899-12-30")
x$end_date = as.Date(x$end_date, format="%m/%d/%y %H:%M:%S")

# type
x$Type = 4

# Extract only piles
# Re-format nPierNumber
unique(x$nPierNumber)
x$nPierNumber = gsub("[[:space:]]","",x$nPierNumber)

x$nPierNumber[] = gsub("^P ","P",x$nPierNumber)
x$nPierNumber[] = gsub("P-","P",x$nPierNumber)

x$nPierNumber = gsub("LS","-LS",x$nPierNumber)
x$nPierNumber = gsub("RS","-RS",x$nPierNumber)

# Join 
y = read.xlsx(MLTable)
yx = left_join(y,x,by=c("nPierNumber","Type"))

## Check if the number of Status1 for each Type is same between x and yx.
## Check for piles with completed status
head(yx)
x_pile = x$nPierNumber[which(x$Status1==4)]
yx_pile = yx$nPierNumber[which(yx$Status1.y==4 & yx$Type==4 & yx$CP.x=="N-04")]

str(x_pile)
str(yx_pile)

missing_in_yx = x_pile[!x_pile %in% yx_pile] # not exist in yx table
missing_in_x = yx_pile[!yx_pile %in% x_pile] # not exist in x table

check_Completed()

# check all statuses
x_t = table(x$Status1)
yx_t = table(yx$Status1.y[which(yx$CP.x=="N-04" & yx$Type==4)])

check = x_t %in% yx_t
check_function()

# NA for status = 1 (To be Constructed)
#gg = which(yx$Status1.y>0)

gg = which(yx$CP.x=="N-04" & yx$Type==4)

library(lubridate)
yx$end_date.x = as.Date(yx$end_date.x, origin = "1899-12-30")
yx$end_date.x = as.Date(yx$end_date.x, format="%m/%d/%y %H:%M:%S")

yx$Status1.x[gg] = yx$Status1.y[gg]
yx$end_date.x[gg] = yx$end_date.y[gg]

str(yx)
delField = which(str_detect(colnames(yx),"Status1.y|CP.y|end_date.y"))
yx = yx[,-delField]

# Change Status name
colnames(yx)[str_detect(colnames(yx),pattern="Status1")] = "Status1"
colnames(yx)[str_detect(colnames(yx),pattern="CP")] = "CP"
colnames(yx)[str_detect(colnames(yx),pattern="end_date")] = "end_date"

# Convert nA to 1 (to be Constructed)
id = which(is.na(yx$Status1))
yx$Status1[id] = 1

# Add date of updating table
## Delete old ones
iid = which(colnames(yx) %in% colnames(yx)[str_detect(colnames(yx),"updated|Updated|UPDATED")])
yx = yx[,-iid]

## Add new dates
yx$updated = ymd(date_update)

yx$updated = as.Date(yx$updated, origin = "1899-12-30")
yx$updated = as.Date(yx$updated, format="%m/%d/%y %H:%M:%S")

yx$end_date = as.Date(yx$end_date, origin = "1899-12-30")
yx$end_date = as.Date(yx$end_date, format="%m/%d/%y %H:%M:%S")


yx[is.na(yx$Status1),]

#t=yx$nPierNumber[which(yx$CP=="N-02" & yx$Type==2 & yx$Status1==4)]

# 
write.xlsx(yx, MLTable)

###
# summary table to check
y = read.xlsx(MLTable)
y1 = y[which(y$Status1 == 4),]
##agg_df <- aggregate(y1$Status1, by=list(y1$CP, y1$Type, y1$Year, y1$Status1), FUN=length)
agg_df <- aggregate(y1$Status1, by=list(y1$CP, y1$Type, y1$Status1), FUN=length)
agg_df


##
agg_df <- aggregate(y1$Status1, by=list(y1$Year, y1$Month, y1$Type), FUN=length)
agg_df

ttt = agg_df[order(agg_df$Group.1, agg_df$Group.2, agg_df$Group.3),]

## choose your own files and calculate summary
a = file.choose()
y = read.xlsx(a)
y1 = y[which(y$Status1 == 4),]
agg_df <- aggregate(y1$Status1, by=list(y1$CP, y1$Type, y1$Status1), FUN=length)
agg_df



